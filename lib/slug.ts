// Gera um endereço (slug) a partir de um nome: "Excursões do João" -> "excursoes-do-joao"
export function gerarSlug(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50)
    .replace(/-+$/g, "");
}

// Mesmo formato exigido pelo banco (check excursionistas_slug_formato).
export function slugValido(slug: string): boolean {
  return slug.length >= 3 && slug.length <= 50 && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug);
}
