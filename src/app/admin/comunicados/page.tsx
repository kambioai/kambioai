import { Megaphone } from "lucide-react";

import { FormComunicado } from "@/components/admin/form-comunicado";
import { EstadoVazio } from "@/components/estado-vazio/estado-vazio";
import { cn } from "@/lib/utils";
import { listarComunicados } from "@/lib/dados/admin";

function diasLabel(dias: number): string {
  if (dias === 0) return "hoje";
  if (dias === 1) return "ontem";
  return `há ${dias} dias`;
}

export default async function ComunicadosAdmin() {
  const comunicados = await listarComunicados();

  return (
    <section className="space-y-5">
      <h1 className="font-grotesk text-titulo font-bold text-principal">
        Comunicados
      </h1>

      <FormComunicado />

      {comunicados.length === 0 ? (
        <EstadoVazio
          titulo="Nenhum comunicado"
          mensagem="Crie um aviso para enviar às oficinas."
          icone={Megaphone}
        />
      ) : (
        <ul className="space-y-2">
          {comunicados.map((c) => (
            <li
              key={c.id}
              className="rounded-xl border border-linha bg-superficie p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-texto">{c.titulo}</p>
                  <p className="text-legenda text-texto-secundario">
                    Para: {c.publico}
                    {c.status === "enviado"
                      ? ` · ${c.alcance} oficinas · enviado ${diasLabel(c.diasAtras)}`
                      : ""}
                  </p>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-3 py-1 text-legenda font-medium",
                    c.status === "enviado"
                      ? "bg-confirmado/10 text-confirmado"
                      : "bg-fundo text-texto-secundario",
                  )}
                >
                  {c.status === "enviado" ? "Enviado" : "Rascunho"}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
