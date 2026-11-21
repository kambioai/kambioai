import { Esqueleto } from "@/components/ui/esqueleto";

/**
 * Esqueleto genérico de uma tela, usado pelos `loading.tsx` de cada rota
 * (Regras de UX §10: enquanto carrega, esqueleto — nunca tela branca).
 */
export function EsqueletoTela() {
  return (
    <section className="space-y-5" aria-hidden="true">
      <Esqueleto className="h-7 w-40" />
      <Esqueleto className="h-28 w-full rounded-2xl" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Esqueleto className="h-20 rounded-2xl" />
        <Esqueleto className="h-20 rounded-2xl" />
        <Esqueleto className="h-20 rounded-2xl" />
      </div>
      <Esqueleto className="h-48 w-full rounded-2xl" />
    </section>
  );
}
