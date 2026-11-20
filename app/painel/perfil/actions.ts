"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { documentoValido, soDigitos } from "@/lib/documento";
import { gerarSlug, slugValido } from "@/lib/slug";

type Campo = "nome" | "slug" | "documento" | "cadastur";

export type PerfilState = {
  ok?: boolean;
  erro?: string;
  errosCampo?: Partial<Record<Campo, string>>;
  valores?: Record<Campo, string>;
};

const texto = (fd: FormData, campo: string) => String(fd.get(campo) ?? "").trim();

export async function salvarPerfil(_anterior: PerfilState, formData: FormData): Promise<PerfilState> {
  const valores = {
    nome: texto(formData, "nome"),
    slug: texto(formData, "slug").toLowerCase(),
    documento: texto(formData, "documento"),
    cadastur: texto(formData, "cadastur"),
  };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { erro: "Sessão expirada. Entre novamente.", valores };

  const { data: existente } = await supabase.from("excursionistas").select("id").eq("usuario_id", user.id).maybeSingle();

  // Validação
  const errosCampo: PerfilState["errosCampo"] = {};
  if (valores.nome.length < 2 || valores.nome.length > 80) errosCampo.nome = "Use entre 2 e 80 caracteres.";
  if (!documentoValido(valores.documento)) errosCampo.documento = "Informe um CPF ou CNPJ válido.";
  if (valores.cadastur.length > 30) errosCampo.cadastur = "Número muito longo.";

  let slug = valores.slug;
  if (!existente) {
    slug = slug || gerarSlug(valores.nome);
    if (!slugValido(slug)) errosCampo.slug = "Use 3 a 50 letras minúsculas, números e hífens (sem espaços).";
  }
  if (Object.keys(errosCampo).length) return { errosCampo, valores: { ...valores, slug } };

  const cadastur = valores.cadastur || null;
  let excursionistaId = existente?.id as string | undefined;

  if (!excursionistaId) {
    const { data, error } = await supabase
      .from("excursionistas")
      .insert({ usuario_id: user.id, nome_publico: valores.nome, cadastur, slug })
      .select("id")
      .single();
    if (error) {
      if (error.code === "23505") {
        return { errosCampo: { slug: "Esse endereço já está em uso. Escolha outro." }, valores: { ...valores, slug } };
      }
      return { erro: "Não foi possível salvar o perfil. Tente novamente.", valores: { ...valores, slug } };
    }
    excursionistaId = data.id;
  } else {
    const { error } = await supabase
      .from("excursionistas")
      .update({ nome_publico: valores.nome, cadastur })
      .eq("id", excursionistaId);
    if (error) return { erro: "Não foi possível salvar o perfil. Tente novamente.", valores: { ...valores, slug } };
  }

  // CPF/CNPJ fica numa tabela privada (só o dono enxerga).
  const { error: erroDoc } = await supabase
    .from("excursionistas_privado")
    .upsert({ excursionista_id: excursionistaId, cnpj_cpf: soDigitos(valores.documento) });
  if (erroDoc) return { erro: "Perfil salvo, mas não foi possível salvar o CPF/CNPJ. Tente novamente.", valores: { ...valores, slug } };

  revalidatePath("/painel");
  return { ok: true, valores: { ...valores, slug } };
}
