"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MailCheck } from "lucide-react";

import { CampoTexto } from "@/components/auth/campo-texto";
import { Button } from "@/components/ui/button";
import { criarClienteNavegador } from "@/lib/supabase/client";

const esquema = z.object({
  email: z.string().email("Digite um e-mail válido."),
});

type Dados = z.infer<typeof esquema>;

export function FormularioRecuperar() {
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Dados>({ resolver: zodResolver(esquema) });

  async function aoEnviar(dados: Dados) {
    setErro(null);
    const supabase = criarClienteNavegador();
    // O link do e-mail volta direto para /redefinir-senha. A troca do código
    // por sessão acontece NO NAVEGADOR (o cliente do Supabase faz isso sozinho
    // ao carregar a página): é lá que mora o "verificador" do PKCE, então é o
    // único lugar onde a troca funciona de forma confiável.
    const { error } = await supabase.auth.resetPasswordForEmail(dados.email, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });
    if (error) {
      setErro("Não deu pra enviar agora. Tente de novo em instantes.");
      return;
    }
    // Por segurança não revelamos se o e-mail existe: a mesma tela aparece
    // tendo conta ou não.
    setEnviado(true);
  }

  if (enviado) {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="grid h-14 w-14 place-items-center rounded-full bg-confirmado/10 text-confirmado">
          <MailCheck className="h-7 w-7" strokeWidth={2} aria-hidden="true" />
        </div>
        <p className="text-corpo text-texto">
          Se esse e-mail estiver cadastrado, enviamos um link pra você criar uma
          senha nova. Confira sua caixa de entrada.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(aoEnviar)} className="space-y-4" noValidate>
      {erro ? (
        <p className="rounded-xl bg-erro-fundo px-3 py-2 text-legenda text-erro">
          {erro}
        </p>
      ) : null}
      <CampoTexto
        label="E-mail"
        type="email"
        autoComplete="email"
        placeholder="voce@oficina.com.br"
        erro={errors.email?.message}
        {...register("email")}
      />
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Enviando..." : "Enviar link de recuperação"}
      </Button>
    </form>
  );
}
