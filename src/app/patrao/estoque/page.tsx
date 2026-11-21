import { EstoqueCatalogo } from "@/components/estoque-catalogo";
import { listarCatalogo } from "@/lib/dados";

export default async function Estoque() {
  const itens = await listarCatalogo();

  return (
    <section className="space-y-5">
      <h1 className="font-grotesk text-titulo font-bold text-principal">
        Estoque e catálogo
      </h1>
      <EstoqueCatalogo itens={itens} />
    </section>
  );
}
