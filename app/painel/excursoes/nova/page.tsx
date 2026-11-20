import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ExcursaoForm } from "./ExcursaoForm";

export const metadata = { title: "Nova excursão — Excurfy" };

export default async function NovaExcursao() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Precisa do perfil de excursionista antes de criar excursões.
  const { data: exc } = await supabase.from("excursionistas").select("id").eq("usuario_id", user.id).maybeSingle();
  if (!exc) redirect("/painel/perfil");

  return (
    <>
      <h1 style={{ fontSize: 28, marginTop: 0 }}>Nova excursão</h1>
      <p style={{ color: "var(--ink-muted)", maxWidth: 560 }}>
        Ela é criada como rascunho. Você publica quando estiver pronto.
      </p>
      <ExcursaoForm />
    </>
  );
}
