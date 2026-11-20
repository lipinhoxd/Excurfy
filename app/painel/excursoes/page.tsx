import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { brl, dataBR } from "@/lib/formatar";
import { ButtonLink } from "@/components/ui/Button";
import { ExcursionCard } from "@/components/ui/ExcursionCard";
import type { StatusBadge } from "@/components/ui/Badge";

export const metadata = { title: "Excursões — Excurfy" };

type Linha = { id: string; titulo: string; status: StatusBadge; vagas: number; data_ida: string; pacotes: { preco: number }[] };

export default async function Excursoes() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: exc } = await supabase.from("excursionistas").select("id").eq("usuario_id", user.id).maybeSingle();
  if (!exc) redirect("/painel/perfil");

  // Filtra pelo excursionista: excursões publicadas de outros organizadores também são visíveis pela RLS.
  const { data } = await supabase
    .from("excursoes")
    .select("id, titulo, status, vagas, data_ida, pacotes(preco)")
    .eq("excursionista_id", exc.id)
    .order("data_ida", { ascending: false });
  const excursoes = (data ?? []) as Linha[];

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <h1 style={{ fontSize: 28, margin: 0 }}>Excursões</h1>
        <ButtonLink href="/painel/excursoes/nova">Criar excursão</ButtonLink>
      </div>

      {excursoes.length === 0 ? (
        <p style={{ color: "var(--ink-muted)", marginTop: 24 }}>Você ainda não criou nenhuma excursão.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginTop: 24 }}>
          {excursoes.map((e) => {
            const menor = e.pacotes.length ? Math.min(...e.pacotes.map((p) => Number(p.preco))) : null;
            return (
              <ExcursionCard
                key={e.id}
                href={`/painel/excursoes/${e.id}`}
                titulo={e.titulo}
                data={dataBR(e.data_ida)}
                vagas={`${e.vagas} vagas`}
                status={e.status}
                preco={menor === null ? "Sem pacotes" : `A partir de ${brl(menor)}`}
              />
            );
          })}
        </div>
      )}
    </>
  );
}
