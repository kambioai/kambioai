"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { CampoTexto } from "@/components/auth/campo-texto";
import { Button } from "@/components/ui/button";

const esquema = z.object({
  nome: z.string().min(2, "Digite seu nome."),
  celular: z.string().min(10, "Digite um celular com DDD."),
  email: z.string().email("Digite um e-mail válido."),
  senha: z.string().min(6, "A senha precisa de pelo menos 6 caracteres."),
});

type Dados = z.infer<typeof esquema>;

export function FormularioCriarConta() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Dados>({ resolver: zodResolver(esquema) });

  // Fictício: depois de criar a conta, escolhe o plano e começa a configurar.
  function aoEnviar() {
    router.push("/escolher-plano");
  }

  return (
    <form onSubmit={handleSubmit(aoEnviar)} className="space-y-4" noValidate>
      <CampoTexto
        label="Seu nome"
        autoComplete="name"
        placeholder="Ex.: José da Silva"
        erro={errors.nome?.message}
        {...register("nome")}
      />
      <CampoTexto
        label="Celular"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        placeholder="(62) 99999-9999"
        erro={errors.celular?.message}
        {...register("celular")}
      />
      <CampoTexto
        label="E-mail"
        type="email"
        autoComplete="email"
        placeholder="voce@oficina.com.br"
        erro={errors.email?.message}
        {...register("email")}
      />
      <CampoTexto
        label="Senha"
        type="password"
        autoComplete="new-password"
        placeholder="Crie uma senha"
        erro={errors.senha?.message}
        {...register("senha")}
      />
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        Criar conta
      </Button>
    </form>
  );
}
