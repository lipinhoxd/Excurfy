import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { createClient } from "@/lib/supabase/server";
import { sair } from "../login/actions";

export const metadata = { title: "Painel — Excurfy" };

export default async function Painel() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // A RLS garante que só a própria linha de usuarios é retornada.
  const { data: perfil } = await supabase.from("usuarios").select("nome").eq("id", user.id).maybeSingle();

  return (
    <main className="wrap" style={{ padding: "24px" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Logo />
        <form action={sair}><button className="btn btn--ghost" type="submit" style={{ width: "auto" }}>Sair</button></form>
      </header>
      <h1 style={{ fontSize: 28, marginTop: 40 }}>Olá, {perfil?.nome ?? user.email}</h1>
      <p style={{ color: "var(--ink-muted)" }}>Seu painel de excursões vem na próxima etapa.</p>
    </main>
  );
}
