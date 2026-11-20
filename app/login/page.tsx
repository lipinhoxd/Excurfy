import { Logo } from "@/components/Logo";
import { Input } from "@/components/ui/Input";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { entrar } from "./actions";

export const metadata = { title: "Entrar — Excurfy" };

export default async function Login({ searchParams }: { searchParams: Promise<{ erro?: string; ok?: string }> }) {
  const { erro, ok } = await searchParams;
  return (
    <main className="auth">
      <a href="/" aria-label="Excurfy, página inicial"><Logo /></a>
      <div className="auth__card">
        <h1 style={{ margin: "0 0 20px", fontSize: 24 }}>Entrar</h1>
        {erro && <p className="msg msg--erro" role="alert">{erro}</p>}
        {ok && <p className="msg msg--ok" role="status">{ok}</p>}
        <form action={entrar}>
          <Input label="E-mail" name="email" type="email" autoComplete="email" required />
          <Input label="Senha" name="senha" type="password" autoComplete="current-password" required />
          <SubmitButton block>Entrar</SubmitButton>
        </form>
        <p style={{ marginBottom: 0, color: "var(--ink-muted)" }}>
          Não tem conta? <a className="link" href="/cadastro">Cadastre-se</a>
        </p>
      </div>
    </main>
  );
}
