"use client";

import { useState } from "react";

import { AvisoDesfazer } from "@/components/aviso-desfazer/aviso-desfazer";
import { Button } from "@/components/ui/button";

/** Demonstração interativa do aviso com Desfazer na vitrine. */
export function DemoAvisoDesfazer() {
  const [visivel, setVisivel] = useState(false);
  const [desfeito, setDesfeito] = useState(false);

  return (
    <div className="space-y-3">
      <Button
        variant="secundario"
        onClick={() => {
          setDesfeito(false);
          setVisivel(true);
        }}
      >
        Simular salvar uma OS
      </Button>
      {visivel ? (
        <AvisoDesfazer
          mensagem="OS salva."
          aoDesfazer={() => setDesfeito(true)}
          aoFechar={() => setVisivel(false)}
        />
      ) : null}
      {desfeito ? (
        <p className="text-legenda text-texto-secundario">Ação desfeita.</p>
      ) : null}
    </div>
  );
}
