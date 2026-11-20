import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { brl, dataBR, horaCurta } from "@/lib/formatar";
import { Badge, type StatusBadge } from "@/components/ui/Badge";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { mudarStatus } from "./actions";

export const metadata = { title: "Excursão — Excurfy" };

type Detalhe = {
  id: string; titulo: string; descricao: string | null; status: StatusBadge; vagas: number;
  data_ida: string; data_volta: string | null;
  pacotes: { id: string; nome: string; preco: number }[];
  embarques: { id: string; local: string; horario: string }[];
};

export default async function DetalheExcursao({
  params, searchParams,
}: { params: Promise<{ id: string }>; searchParams: Promise<{ erro?: string; ok?: string }> }) {
  const { id } = await params;
  const { erro, ok } = await searchParams;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: exc } = await supabase.from("excursionistas").select("id").eq("usuario_id", user.id).maybeSingle();
  if (!exc) redirect("/painel/perfil");

  const { data } = await supabase
    .from("excursoes")
    .select("id, titulo, descricao, status, vagas, data_ida, data_volta, pacotes(id, nome, preco), embarques(id, local, horario)")
    .eq("id", id)
    .eq("excursionista_id", exc.id)
    .maybeSingle();
  if (!data) notFound();
  const e = data as Detalhe;

  const podePublicar = e.status === "rascunho";
  const podeEncerrar = e.status === "publicada";
  const podeCancelar = e.status === "rascunho" || e.status === "publicada";

  return (
    <>
      <p style={{ margin: "0 0 16px" }}><a className="link" href="/painel/excursoes">← Voltar às excursões</a></p>
      <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
        <h1 style={{ fontSize: 28, margin: 0 }}>{e.titulo}</h1>
        <Badge status={e.status} />
      </div>
      <p style={{ color: "var(--ink-muted)" }}>
        Ida em {dataBR(e.data_ida)}{e.data_volta ? ` · Volta em ${dataBR(e.data_volta)}` : ""} · {e.vagas} vagas
      </p>
      {e.descricao && <p style={{ maxWidth: 640 }}>{e.descricao}</p>}

      {erro && <p className="msg msg--erro" role="alert" style={{ maxWidth: 640 }}>{erro}</p>}
      {ok && <p className="msg msg--ok" role="status" style={{ maxWidth: 640 }}>{ok}</p>}

      <section style={{ marginTop: 24, maxWidth: 640 }}>
        <h2 style={{ fontSize: 20 }}>Pacotes</h2>
        <div style={{ display: "grid", gap: 8 }}>
          {e.pacotes.map((p) => (
            <div key={p.id} className="card" style={{ flexDirection: "row", justifyContent: "space-between", padding: 16 }}>
              <span>{p.nome}</span><strong>{brl(Number(p.preco))}</strong>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginTop: 24, maxWidth: 640 }}>
        <h2 style={{ fontSize: 20 }}>Pontos de embarque</h2>
        {e.embarques.length === 0 ? (
          <p style={{ color: "var(--ink-muted)" }}>Nenhum ponto de embarque informado.</p>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {e.embarques.map((b) => (
              <div key={b.id} className="card" style={{ flexDirection: "row", justifyContent: "space-between", padding: 16 }}>
                <span>{b.local}</span><strong>{horaCurta(b.horario)}</strong>
              </div>
            ))}
          </div>
        )}
      </section>

      {(podePublicar || podeEncerrar || podeCancelar) && (
        <section style={{ marginTop: 32, maxWidth: 640 }}>
          <h2 style={{ fontSize: 20 }}>Ações</h2>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}>
            {podePublicar && (
              <form action={mudarStatus}>
                <input type="hidden" name="id" value={e.id} />
                <input type="hidden" name="status" value="publicada" />
                <SubmitButton>Publicar</SubmitButton>
              </form>
            )}
            {podeEncerrar && (
              <form action={mudarStatus}>
                <input type="hidden" name="id" value={e.id} />
                <input type="hidden" name="status" value="encerrada" />
                <SubmitButton variant="secondary">Encerrar</SubmitButton>
              </form>
            )}
          </div>

          {podeCancelar && (
            <details style={{ marginTop: 16 }}>
              <summary className="link" style={{ cursor: "pointer" }}>Cancelar excursão</summary>
              <form action={mudarStatus} className="card" style={{ marginTop: 8 }}>
                <p style={{ margin: 0 }}>Esta ação não pode ser desfeita. Tem certeza que deseja cancelar?</p>
                <input type="hidden" name="id" value={e.id} />
                <input type="hidden" name="status" value="cancelada" />
                <div><SubmitButton variant="secondary">Sim, cancelar excursão</SubmitButton></div>
              </form>
            </details>
          )}
        </section>
      )}
    </>
  );
}
