import { GerenciarEstoque } from "@/components/estoque/gerenciar-estoque";
import { listarCatalogo } from "@/lib/dados";

export default async function Estoque() {
  const itens = await listarCatalogo();

  return (
    <section className="space-y-5">
      <h1 className="font-grotesk text-titulo font-bold text-principal">
        Estoque e catálogo
      </h1>
      <p className="text-corpo text-texto-secundario">
        Adicione, edite ou remova itens a qualquer momento — tudo é salvo na
        hora.
      </p>
      <GerenciarEstoque itens={itens} />
    </section>
  );
}
