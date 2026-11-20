// "2026-12-29" -> "29/12/2026" (sem passar por Date, para não deslocar o dia por fuso horário)
export function dataBR(iso: string | null | undefined): string {
  if (!iso) return "";
  const [a, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${a}`;
}

export const brl = (v: number) => Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// "09:00:00" -> "09:00"
export const horaCurta = (h: string) => h.slice(0, 5);
