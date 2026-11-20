import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Destino do link de confirmação enviado por e-mail.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}/painel`);
  }
  return NextResponse.redirect(`${origin}/login?erro=${encodeURIComponent("Link inválido ou expirado. Entre com seu e-mail e senha.")}`);
}
