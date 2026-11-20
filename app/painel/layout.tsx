import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/Button";
import { PainelNav } from "@/components/ui/PainelNav";
import { sair } from "../login/actions";

export default function PainelLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="painel__topo">
        <Logo />
        <form action={sair}><Button variant="secondary" type="submit">Sair</Button></form>
      </header>
      <div className="painel__corpo">
        <PainelNav />
        <main className="painel__main">{children}</main>
      </div>
    </>
  );
}
