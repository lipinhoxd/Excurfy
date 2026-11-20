import { Logo } from "@/components/Logo";
import { Badge, type StatusBadge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ExcursionCard } from "@/components/ui/ExcursionCard";
import { Input } from "@/components/ui/Input";

// Página só para conferir o visual dos componentes. Remover ou proteger antes do lançamento.
export const metadata = { title: "Design system — Excurfy", robots: { index: false, follow: false } };

const CORES = ["brand", "brand-strong", "navy", "teal", "sand", "surface", "surface-alt", "border", "ink", "ink-muted", "danger", "warning"];
const STATUS: StatusBadge[] = ["pago", "embarque_confirmado", "parcela_a_vencer", "ultimas_vagas", "atrasado"];

export default function DesignSystem() {
  return (
    <main className="wrap" style={{ paddingBottom: 64 }}>
      <header style={{ padding: "24px 0" }}><Logo /></header>
      <h1 style={{ fontSize: 32 }}>Design system</h1>
      <p style={{ color: "var(--ink-muted)" }}>Muda para o tema escuro conforme a configuração do seu sistema.</p>

      <section className="ds-secao">
        <h2>Cores</h2>
        <div className="amostras">
          {CORES.map((c) => (
            <div className="amostra" key={c}>
              <div className="amostra__cor" style={{ background: `var(--${c})` }} />
              <div className="amostra__info">--{c}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="ds-secao">
        <h2>Tipografia</h2>
        <p style={{ fontFamily: "var(--font-sora)", fontWeight: 700, fontSize: 32, margin: 0 }}>Sora Bold: títulos e números</p>
        <p style={{ margin: "8px 0 0" }}>Inter: texto corrido e formulários.</p>
      </section>

      <section className="ds-secao">
        <h2>Button</h2>
        <div className="ds-linha">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button loading>Carregando</Button>
          <Button disabled>Desabilitado</Button>
          <ButtonLink href="#">Link como botão</ButtonLink>
        </div>
      </section>

      <section className="ds-secao" style={{ maxWidth: 420 }}>
        <h2>Input</h2>
        <Input label="Nome da excursão" placeholder="[Nome da excursão]" />
        <Input label="Vagas" type="number" ajuda="Quantidade total de poltronas." />
        <Input label="WhatsApp" defaultValue="123" erro="Informe um número válido com DDD." />
      </section>

      <section className="ds-secao">
        <h2>Badge de status</h2>
        <div className="ds-linha">{STATUS.map((s) => <Badge key={s} status={s} />)}</div>
      </section>

      <section className="ds-secao">
        <h2>ExcursionCard</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          <ExcursionCard titulo="[Nome da excursão]" data="[Data]" local="[Cidade de destino]" preco="[R$]" vagas="[N] vagas" status="ultimas_vagas" href="#" />
          <ExcursionCard titulo="[Nome da excursão]" data="[Data]" local="[Cidade de destino]" preco="[R$]" status="pago" />
        </div>
      </section>

      <section className="ds-secao" style={{ borderBottom: 0 }}>
        <h2>Sidebar do painel</h2>
        <p style={{ color: "var(--ink-muted)" }}>
          Veja em <a className="link" href="/painel">/painel</a> (precisa de login): lateral no computador e menu inferior no celular.
        </p>
      </section>
    </main>
  );
}
