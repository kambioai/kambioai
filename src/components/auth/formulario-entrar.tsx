"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { CampoTexto } from "@/components/auth/campo-texto";
import { Button } from "@/components/ui/button";

const esquema = z.object({
  email: z.string().email("Digite um e-mail válido."),
  senha: z.string().min(1, "Digite sua senha."),
});

type Dados = z.infer<typeof esquema>;

export function FormularioEntrar() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Dados>({ resolver: zodResolver(esquema) });

  // Fictício (Fase 4): o login real entra na Fase 6. Aqui só leva ao app.
  function aoEnviar() {
    router.push("/patrao/painel");
  }

  return (
    <form onSubmit={handleSubmit(aoEnviar)} className="space-y-4" noValidate>
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
        autoComplete="current-password"
        placeholder="••••••••"
        erro={errors.senha?.message}
        {...register("senha")}
      />
      <div className="text-right">
        <Link
          href="/recuperar-senha"
          className="text-legenda font-medium text-principal hover:underline"
        >
          Esqueci minha senha
        </Link>
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        Entrar
      </Button>
    </form>
  );
}
