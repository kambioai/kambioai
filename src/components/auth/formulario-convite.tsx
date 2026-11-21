"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { CampoTexto } from "@/components/auth/campo-texto";
import { Button } from "@/components/ui/button";

const esquema = z
  .object({
    senha: z.string().min(6, "A senha precisa de pelo menos 6 caracteres."),
    confirmar: z.string(),
  })
  .refine((d) => d.senha === d.confirmar, {
    message: "As senhas não são iguais.",
    path: ["confirmar"],
  });

type Dados = z.infer<typeof esquema>;

export function FormularioConvite() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Dados>({ resolver: zodResolver(esquema) });

  // Fictício: o funcionário cria a senha e cai no Pátio dele.
  function aoEnviar() {
    router.push("/funcionario/patio");
  }

  return (
    <form onSubmit={handleSubmit(aoEnviar)} className="space-y-4" noValidate>
      <CampoTexto
        label="Crie sua senha"
        type="password"
        autoComplete="new-password"
        placeholder="Pelo menos 6 caracteres"
        erro={errors.senha?.message}
        {...register("senha")}
      />
      <CampoTexto
        label="Confirme a senha"
        type="password"
        autoComplete="new-password"
        placeholder="Repita a senha"
        erro={errors.confirmar?.message}
        {...register("confirmar")}
      />
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        Entrar na equipe
      </Button>
    </form>
  );
}
