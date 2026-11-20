"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const texto = (fd: FormData, campo: string) => String(fd.get(campo) ?? "").trim();
const para = (rota: string, chave: "erro" | "ok", msg: string) => redirect(`${rota}?${chave}=${encodeURIComponent(msg)}`);

export async function entrar(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: texto(formData, "email"),
    password: String(formData.get("senha") ?? ""),
  });
  if (error) {
    para("/login", "erro", error.code === "email_not_confirmed" ? "Confirme seu e-mail antes de entrar." : "E-mail ou senha incorretos.");
  }
  redirect("/painel");
}

export async function cadastrar(formData: FormData) {
  const nome = texto(formData, "nome");
  const senha = String(formData.get("senha") ?? "");
  if (!nome) para("/cadastro", "erro", "Informe seu nome.");
  if (senha.length < 8) para("/cadastro", "erro", "A senha precisa ter pelo menos 8 caracteres.");

  const origin = (await headers()).get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: texto(formData, "email"),
    password: senha,
    options: { data: { nome }, emailRedirectTo: `${origin}/auth/callback` },
  });
  if (error) para("/cadastro", "erro", "Não foi possível criar a conta. Verifique os dados e tente novamente.");

  // Com confirmação de e-mail ligada, ainda não há sessão.
  if (!data.session) para("/login", "ok", "Conta criada. Enviamos um e-mail para você confirmar o cadastro.");
  redirect("/painel");
}

export async function sair() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
