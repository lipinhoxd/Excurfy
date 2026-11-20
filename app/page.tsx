import { supabase } from "@/lib/supabase/public";
import { Logo } from "@/components/Logo";

export const revalidate = 60;

type Plano = { id: string; nome: string; mensalidade: number; taxa_venda: number; limite_excursoes: number | null };

const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default async function Home() {
  const { data: planos } = await supabase.from("planos").select("*").order("mensalidade");

  return (
    <main>
      <header className="wrap" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px" }}>
        <Logo />
        <span style={{ display: "flex", gap: 8 }}><a className="btn btn--ghost" href="#planos">Planos</a><a className="btn btn--ghost" href="/login">Entrar</a></span>
      </header>

      <section style={{ background: "var(--navy)", color: "#fff" }}>
        <div className="wrap" style={{ padding: "72px 24px" }}>
          <h1 style={{ fontSize: "clamp(32px, 6vw, 56px)", lineHeight: 1.05, margin: 0, maxWidth: 720 }}>
            Sua excursão, do anúncio ao embarque.
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.6, color: "#C9CCE0", maxWidth: 560, marginTop: 20 }}>
            Crie a página da sua excursão, receba no Pix e no cartão, controle passageiros e faça o check-in por QR code.
            Tudo em um só lugar.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 28 }}>
            <a className="btn" href="/cadastro">Começar grátis</a>
          </div>
        </div>
      </section>

      <section id="planos" className="wrap" style={{ padding: "64px 24px" }}>
        <h2 style={{ fontSize: 32, margin: "0 0 24px" }}>Planos</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
          {(planos as Plano[] | null)?.map((p) => (
            <article key={p.id} style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: 24, background: p.nome === "Pro" ? "var(--sand)" : "var(--surface)" }}>
              <h3 style={{ margin: 0, fontSize: 20 }}>{p.nome}</h3>
              <p style={{ fontFamily: "var(--font-sora)", fontWeight: 700, fontSize: 32, margin: "12px 0 4px" }}>
                {Number(p.mensalidade) === 0 ? "Grátis" : `${brl(Number(p.mensalidade))}/mês`}
              </p>
              <p style={{ color: "var(--ink-muted)", margin: 0 }}>
                Taxa de {Number(p.taxa_venda)}% por venda · {p.limite_excursoes ? `${p.limite_excursoes} excursão ativa` : "excursões ilimitadas"}
              </p>
            </article>
          )) ?? <p>Não foi possível carregar os planos.</p>}
        </div>
      </section>

      <footer style={{ borderTop: "1px solid var(--border)" }}>
        <div className="wrap" style={{ padding: "24px", color: "var(--ink-muted)", fontSize: 14 }}>© Excurfy · Projeto em desenvolvimento</div>
      </footer>
    </main>
  );
}
