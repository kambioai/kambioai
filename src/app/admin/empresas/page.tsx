import { ListaEmpresas } from "@/components/admin/lista-empresas";
import { listarEmpresasAdmin } from "@/lib/dados/admin";

export default async function EmpresasAdmin() {
  const empresas = await listarEmpresasAdmin();

  return (
    <section className="space-y-5">
      <div>
        <h1 className="font-grotesk text-titulo font-bold text-principal">
          Empresas
        </h1>
        <p className="text-corpo text-texto-secundario">
          {empresas.length} oficinas no Kambio. Toque numa para ver a ficha e as
          ações.
        </p>
      </div>
      <ListaEmpresas empresas={empresas} />
    </section>
  );
}
