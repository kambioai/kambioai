"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { criarClienteNavegador } from "@/lib/supabase/client";

/** Botão de sair: encerra a sessão no Supabase e volta para o login. */
export function BotaoSair({ className }: { className?: string }) {
  const router = useRouter();
  const [saindo, setSaindo] = useState(false);

  async function sair() {
    setSaindo(true);
    await criarClienteNavegador().auth.signOut();
    router.push("/entrar");
    router.refresh();
  }

  return (
    <Button
      variant="secundario"
      onClick={sair}
      disabled={saindo}
      className={className}
    >
      {saindo ? "Saindo..." : "Sair"}
    </Button>
  );
}
