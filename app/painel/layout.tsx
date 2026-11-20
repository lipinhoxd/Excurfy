import { Logo } from "@/components/Logo";
import { Button, ButtonLink } from "@/components/ui/Button";
import { PainelNav } from "@/components/ui/PainelNav";
import { sair } from "../login/actions";

export default function PainelLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="painel__topo">
        <Logo />
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <ButtonLink variant="ghost" href="/painel/perfil">Perfil</ButtonLink>
          <form action={sair}><Button variant="secondary" type="submit">Sair</Button></form>
        </div>
      </header>
      <div className="painel__corpo">
        <PainelNav />
        <main className="painel__main">{children}</main>
      </div>
    </>
  );
}
