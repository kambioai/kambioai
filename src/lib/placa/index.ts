// Validação de placa (CLAUDE.md §6): Mercosul (ABC1D23) ou antigo (ABC1234).

const MERCOSUL = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;
const ANTIGO = /^[A-Z]{3}[0-9]{4}$/;

/** Normaliza: maiúsculas, sem espaços nem hífens. */
export function normalizarPlaca(placa: string): string {
  return placa
    .toUpperCase()
    .replace(/[\s-]/g, "")
    .replace(/[^A-Z0-9]/g, "");
}

/** Placa válida no formato Mercosul ou antigo. */
export function placaValida(placa: string): boolean {
  const p = normalizarPlaca(placa);
  return MERCOSUL.test(p) || ANTIGO.test(p);
}
