"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ExcursaoState = {
  ok?: boolean;
  erro?: string;
  errosCampo?: Record<string, string>;
};

const texto = (fd: FormData, campo: string) => String(fd.get(campo) ?? "").trim();
const lista = (fd: FormData, campo: string) => fd.getAll(campo).map((v) => String(v ?? "").trim());

// Aceita "120", "120,50" e "1.200,50". Retorna null se inválido.
function lerPreco(bruto: string): number | null {
  const s = bruto.replace(/\s|R\$/g, "");
  if (!s) return null;
  const normal = s.includes(",") ? s.replace(/\./g, "").replace(",", ".") : s;
  if (!/^\d+(\.\d{1,2})?$/.test(normal)) return null;
  const n = Number(normal);
  return Number.isFinite(n) && n >= 0 && n <= 100000 ? n : null;
}

const dataValida = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));

export async function criarExcursao(_anterior: ExcursaoState, formData: FormData): Promise<ExcursaoState> {
  const titulo = texto(formData, "titulo");
  const descricao = texto(formData, "descricao");
  const dataIda = texto(formData, "data_ida");
  const dataVolta = texto(formData, "data_volta");
  const vagas = Number(texto(formData, "vagas"));
  const nomes = lista(formData, "pacote_nome");
  const precos = lista(formData, "pacote_preco");
  const locais = lista(formData, "embarque_local");
  const horarios = lista(formData, "embarque_horario");

  const erros: Record<string, string> = {};
  const hoje = new Date().toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" });

  if (titulo.length < 3 || titulo.length > 120) erros.titulo = "Use entre 3 e 120 caracteres.";
  if (descricao.length > 2000) erros.descricao = "Máximo de 2000 caracteres.";
  if (!dataValida(dataIda)) erros.data_ida = "Informe a data de ida.";
  else if (dataIda < hoje) erros.data_ida = "A data de ida não pode estar no passado.";
  if (dataVolta) {
    if (!dataValida(dataVolta)) erros.data_volta = "Data inválida.";
    else if (dataValida(dataIda) && dataVolta < dataIda) erros.data_volta = "A volta não pode ser antes da ida.";
  }
  if (!Number.isInteger(vagas) || vagas < 1 || vagas > 1000) erros.vagas = "Informe de 1 a 1000 vagas.";

  // Pacotes: linhas totalmente vazias são ignoradas.
  const pacotes: { nome: string; preco: number }[] = [];
  nomes.forEach((nome, i) => {
    const bruto = precos[i] ?? "";
    if (!nome && !bruto) return;
    const preco = lerPreco(bruto);
    if (!nome || nome.length > 60 || preco === null) {
      erros[`pacote_${i}`] = "Informe o nome (até 60 caracteres) e um preço válido, ex.: 120,00.";
      return;
    }
    pacotes.push({ nome, preco });
  });
  if (pacotes.length === 0 && !Object.keys(erros).some((k) => k.startsWith("pacote_"))) {
    erros.pacotes = "Adicione pelo menos um pacote.";
  }

  const embarques: { local: string; horario: string }[] = [];
  locais.forEach((local, i) => {
    const horario = horarios[i] ?? "";
    if (!local && !horario) return;
    if (!local || local.length > 120 || !/^\d{2}:\d{2}$/.test(horario)) {
      erros[`embarque_${i}`] = "Informe o local e o horário do embarque.";
      return;
    }
    embarques.push({ local, horario });
  });

  if (Object.keys(erros).length) return { errosCampo: erros, erro: "Corrija os campos indicados." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { erro: "Sessão expirada. Entre novamente." };

  const { error } = await supabase.rpc("criar_excursao", {
    p_titulo: titulo,
    p_descricao: descricao,
    p_data_ida: dataIda,
    p_data_volta: dataVolta || null,
    p_vagas: vagas,
    p_pacotes: pacotes,
    p_embarques: embarques,
  });

  if (error) {
    // P0001 = regras de negócio do banco (limite do plano etc.), já em português.
    if (error.code === "P0001") return { erro: error.message };
    return { erro: "Não foi possível criar a excursão. Verifique os dados e tente novamente." };
  }

  revalidatePath("/painel");
  return { ok: true };
}
