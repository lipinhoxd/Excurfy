import { Logo } from "@/components/Logo";
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
          <div className="field">
            <label htmlFor="nome">Nome</label>
            <input id="nome" name="nome" type="text" autoComplete="name" required />
          </div>
          <div className="field">
            <label htmlFor="email">E-mail</label>
            <input id="email" name="email" type="email" autoComplete="email" required />
          </div>
          <div className="field">
            <label htmlFor="senha">Senha</label>
            <input id="senha" name="senha" type="password" autoComplete="new-password" minLength={8} required aria-describedby="senha-ajuda" />
            <small id="senha-ajuda">Mínimo de 8 caracteres.</small>
          </div>
          <button className="btn" type="submit">Criar conta</button>
        </form>
        <p style={{ marginBottom: 0, color: "var(--ink-muted)" }}>
          Já tem conta? <a className="link" href="/login">Entrar</a>
        </p>
      </div>
    </main>
  );
}
