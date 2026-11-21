import { EstoqueFuncionario } from "@/components/estoque-funcionario";
import { listarCatalogoFuncionario } from "@/lib/dados";

// Consulta de estoque do funcionário: só quantidade e preço de venda,
// sem custo nem lucro. O funcionário não ajusta estoque — só avisa falta.
export default async function EstoqueFuncionarioPage() {
  const itens = await listarCatalogoFuncionario();

  return (
    <section className="space-y-5">
      <h1 className="font-grotesk text-titulo font-bold text-principal">
        Estoque
      </h1>
      <p className="text-corpo text-texto-secundario">
        Veja o que tem e o preço de venda. Faltando algo? Toque em “Avisar
        falta”.
      </p>
      <EstoqueFuncionario itens={itens} />
    </section>
  );
}
