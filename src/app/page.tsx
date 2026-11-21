import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { formatarReais } from "@/lib/utils";

const paleta = [
  { nome: "Principal", valor: "#0F2A4A", classe: "bg-principal", claro: true },
  { nome: "Destaque", valor: "#E8590C", classe: "bg-destaque", claro: true },
  { nome: "Fundo", valor: "#F3F5F8", classe: "bg-fundo", claro: false },
  { nome: "Superfície", valor: "#FFFFFF", classe: "bg-superficie", claro: false },
  { nome: "Texto", valor: "#0E1726", classe: "bg-texto", claro: true },
  {
    nome: "Texto 2",
    valor: "#556070",
    classe: "bg-texto-secundario",
    claro: true,
  },
  { nome: "Linha", valor: "#E2E6EC", classe: "bg-linha", claro: false },
  { nome: "Confirmado", valor: "#0B7A4B", classe: "bg-confirmado", claro: true },
  { nome: "Atenção", valor: "#B54708", classe: "bg-atencao", claro: true },
  { nome: "Erro", valor: "#B42318", classe: "bg-erro", claro: true },
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-8 px-4 py-10">
      <header className="flex flex-col items-center gap-4 text-center">
        <Logo tamanho={64} comNome />
        <h1 className="font-grotesk text-titulo font-bold text-principal">
          Fase 0 — fundação pronta
        </h1>
        <p className="max-w-md text-corpo text-texto-secundario">
          Projeto Next.js com a identidade visual aplicada. Daqui pra frente,
          cada botão da navegação abre uma tela só.
        </p>
      </header>

      <section className="rounded-2xl border border-linha bg-superficie p-5">
        <h2 className="mb-1 font-grotesk text-titulo font-bold text-principal">
          Lucro de hoje
        </h2>
        <p className="font-grotesk text-painel font-bold text-principal">
          {formatarReais(123456)}
        </p>
        <p className="text-legenda text-texto-secundario">
          Número grande em Space Grotesk, formato R$ 1.234,56.
        </p>
      </section>

      <section>
        <h2 className="mb-3 font-grotesk text-titulo font-bold text-principal">
          Paleta
        </h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {paleta.map((cor) => (
            <li
              key={cor.nome}
              className="overflow-hidden rounded-xl border border-linha bg-superficie"
            >
              <div
                className={`${cor.classe} h-16 w-full ${cor.claro ? "text-white" : "text-texto"}`}
              />
              <div className="px-3 py-2">
                <p className="text-corpo font-medium text-texto">{cor.nome}</p>
                <p className="text-legenda text-texto-secundario">
                  {cor.valor}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-wrap gap-3">
        <Button variant="principal">Botão principal</Button>
        <Button variant="secundario">Botão secundário</Button>
        <Button variant="destaque">Falar</Button>
      </section>
    </main>
  );
}
