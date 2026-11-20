import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Painel — Excurfy" };

function Numero({ rotulo, valor, nota }: { rotulo: string; valor: string; nota?: string }) {
  return (
    <div className="card" style={{ gap: 4 }}>
      <span className="card__meta">{rotulo}</span>
      <span className="card__preco">{valor}</span>
      {nota && <span className="card__meta">{nota}</span>}
    </div>
  );
}

export default async function Painel() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // A RLS garante que só as próprias linhas de usuarios/excursionistas são retornadas.
  const [{ data: perfil }, { data: exc }] = await Promise.all([
    supabase.from("usuarios").select("nome").eq("id", user.id).maybeSingle(),
    supabase.from("excursionistas").select("id").eq("usuario_id", user.id).maybeSingle(),
  ]);

  let publicadas = 0, rascunhos = 0, vagas = 0;
  if (exc) {
    // Filtra pelo excursionista: excursões publicadas de outros também são visíveis pela RLS.
    const { data } = await supabase.from("excursoes").select("status, vagas").eq("excursionista_id", exc.id);
    for (const e of data ?? []) {
      if (e.status === "publicada") { publicadas++; vagas += e.vagas; }
      if (e.status === "rascunho") rascunhos++;
    }
  }

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
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, maxWidth: 800 }}>
            <Numero rotulo="Excursões publicadas" valor={String(publicadas)} />
            <Numero rotulo="Rascunhos" valor={String(rascunhos)} />
            <Numero rotulo="Vagas nas publicadas" valor={String(vagas)} />
            <Numero rotulo="Arrecadado no mês" valor="[R$]" nota="Disponível quando houver pagamentos" />
          </div>
          <p style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 24 }}>
            <a className="btn" href="/painel/excursoes/nova">Criar excursão</a>
            <a className="btn btn--secondary" href="/painel/excursoes">Ver excursões</a>
          </p>
        </>
      )}
    </>
  );
}
