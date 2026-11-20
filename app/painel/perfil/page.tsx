import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatarDocumento } from "@/lib/documento";
import { PerfilForm } from "./PerfilForm";

export const metadata = { title: "Perfil — Excurfy" };

export default async function Perfil() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: exc } = await supabase
    .from("excursionistas")
    .select("id, nome_publico, slug, cadastur, cadastur_verificado")
    .eq("usuario_id", user.id)
    .maybeSingle();

  let documento = "";
  if (exc) {
    const { data: priv } = await supabase.from("excursionistas_privado").select("cnpj_cpf").eq("excursionista_id", exc.id).maybeSingle();
    documento = priv?.cnpj_cpf ? formatarDocumento(priv.cnpj_cpf) : "";
  }

  return (
    <>
      <h1 style={{ fontSize: 28, marginTop: 0 }}>Perfil do excursionista</h1>
      <p style={{ color: "var(--ink-muted)", maxWidth: 560 }}>
        {exc
          ? "Estes dados aparecem na página das suas excursões (exceto CPF/CNPJ)."
          : "Complete o perfil para começar a criar excursões. Você entra no plano Grátis."}
      </p>
      <PerfilForm
        jaExiste={!!exc}
        inicial={{ nome: exc?.nome_publico ?? "", slug: exc?.slug ?? "", documento, cadastur: exc?.cadastur ?? "" }}
      />
    </>
  );
}
