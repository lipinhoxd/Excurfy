import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Painel — Excurfy" };

export default async function Painel() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // A RLS garante que só a própria linha de usuarios é retornada.
  const { data: perfil } = await supabase.from("usuarios").select("nome").eq("id", user.id).maybeSingle();

  return (
    <>
      <h1 style={{ fontSize: 28, marginTop: 0 }}>Olá, {perfil?.nome ?? user.email}</h1>
      <p style={{ color: "var(--ink-muted)" }}>Seu painel de excursões vem na próxima etapa.</p>
    </>
  );
}
