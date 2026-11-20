import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Painel — Excurfy" };

export default async function Painel() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // A RLS garante que só as próprias linhas são retornadas.
  const [{ data: perfil }, { data: exc }] = await Promise.all([
    supabase.from("usuarios").select("nome").eq("id", user.id).maybeSingle(),
    supabase.from("excursionistas").select("id").eq("usuario_id", user.id).maybeSingle(),
  ]);

  return (
    <>
      <h1 style={{ fontSize: 28, marginTop: 0 }}>Olá, {perfil?.nome ?? user.email}</h1>
      {!exc ? (
        <section className="card" style={{ maxWidth: 560 }}>
          <h2 style={{ margin: 0, fontSize: 20 }}>Complete seu perfil de excursionista</h2>
          <p className="card__meta">Informe o nome do organizador e o CPF ou CNPJ para começar a criar excursões.</p>
          <div><a className="btn" href="/painel/perfil">Completar perfil</a></div>
        </section>
      ) : (
        <>
          <p style={{ color: "var(--ink-muted)" }}>Suas excursões aparecem aqui na próxima parte desta etapa.</p>
          <a className="btn" href="/painel/excursoes/nova">Criar excursão</a>
        </>
      )}
    </>
  );
}
