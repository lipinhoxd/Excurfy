// Validação de CPF e CNPJ (dígitos verificadores). Trabalha só com dígitos.
export const soDigitos = (v: string) => v.replace(/\D/g, "");

function todosIguais(d: string) {
  return /^(\d)\1+$/.test(d);
}

export function cpfValido(valor: string): boolean {
  const d = soDigitos(valor);
  if (d.length !== 11 || todosIguais(d)) return false;
  for (const t of [9, 10]) {
    let soma = 0;
    for (let i = 0; i < t; i++) soma += Number(d[i]) * (t + 1 - i);
    const dv = ((soma * 10) % 11) % 10;
    if (dv !== Number(d[t])) return false;
  }
  return true;
}

export function cnpjValido(valor: string): boolean {
  const d = soDigitos(valor);
  if (d.length !== 14 || todosIguais(d)) return false;
  for (const t of [12, 13]) {
    let soma = 0;
    let peso = t - 7;
    for (let i = 0; i < t; i++) {
      soma += Number(d[i]) * peso--;
      if (peso < 2) peso = 9;
    }
    const dv = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (dv !== Number(d[t])) return false;
  }
  return true;
}

export function documentoValido(valor: string): boolean {
  const d = soDigitos(valor);
  return d.length === 11 ? cpfValido(d) : d.length === 14 ? cnpjValido(d) : false;
}

export function formatarDocumento(valor: string): string {
  const d = soDigitos(valor);
  if (d.length === 11) return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  if (d.length === 14) return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  return valor;
}
