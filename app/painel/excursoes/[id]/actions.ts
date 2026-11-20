"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const NOVOS_STATUS = ["publicada", "encerrada", "cancelada"] as const;
const MENSAGEM_OK: Record<string, string> = {
  publicada: "Excursão publicada.",
  encerrada: "Excursão encerrada.",
  cancelada: "Excursão cancelada.",
};

export async function mudarStatus(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  const volta = `/painel/excursoes/${id}`;

  if (!/^[0-9a-f-]{36}$/i.test(id) || !(NOVOS_STATUS as readonly string[]).includes(status)) {
    redirect("/painel/excursoes");
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // A RLS limita ao dono; o gatilho do banco valida as transições, o limite do plano e o Cadastur.
  const { data, error } = await supabase.from("excursoes").update({ status }).eq("id", id).select("id");

  if (error) {
    const msg = error.code === "P0001" ? error.message : "Não foi possível alterar a excursão. Tente novamente.";
    redirect(`${volta}?erro=${encodeURIComponent(msg)}`);
  }
  if (!data?.length) redirect("/painel/excursoes");

  revalidatePath("/painel", "layout");
  redirect(`${volta}?ok=${encodeURIComponent(MENSAGEM_OK[status])}`);
}
