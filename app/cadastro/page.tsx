import { Logo } from "@/components/Logo";
import { Input } from "@/components/ui/Input";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { cadastrar } from "../login/actions";

export const metadata = { title: "Criar conta — Excurfy" };

export default async function Cadastro({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const { erro } = await searchParams;
  return (
    <main className="auth">
      <a href="/" aria-label="Excurfy, página inicial"><Logo /></a>
      <div className="auth__card">
        <h1 style={{ margin: "0 0 20px", fontSize: 24 }}>Criar conta</h1>
        {erro && <p className="msg msg--erro" role="alert">{erro}</p>}
        <form action={cadastrar}>
          <Input label="Nome" name="nome" type="text" autoComplete="name" required />
          <Input label="E-mail" name="email" type="email" autoComplete="email" required />
          <Input label="Senha" name="senha" type="password" autoComplete="new-password" minLength={8} required ajuda="Mínimo de 8 caracteres." />
          <SubmitButton block>Criar conta</SubmitButton>
        </form>
        <p style={{ marginBottom: 0, color: "var(--ink-muted)" }}>
          Já tem conta? <a className="link" href="/login">Entrar</a>
        </p>
      </div>
    </main>
  );
}
