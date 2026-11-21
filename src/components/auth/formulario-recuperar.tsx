"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MailCheck } from "lucide-react";

import { CampoTexto } from "@/components/auth/campo-texto";
import { Button } from "@/components/ui/button";

const esquema = z.object({
  email: z.string().email("Digite um e-mail válido."),
});

type Dados = z.infer<typeof esquema>;

export function FormularioRecuperar() {
  const [enviado, setEnviado] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Dados>({ resolver: zodResolver(esquema) });

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
    <form
      onSubmit={handleSubmit(() => setEnviado(true))}
      className="space-y-4"
      noValidate
    >
      <CampoTexto
        label="E-mail"
        type="email"
        autoComplete="email"
        placeholder="voce@oficina.com.br"
        erro={errors.email?.message}
        {...register("email")}
      />
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        Enviar link de recuperação
      </Button>
    </form>
  );
}
