"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { CampoTexto } from "@/components/auth/campo-texto";
import { Button } from "@/components/ui/button";
import { criarClienteNavegador } from "@/lib/supabase/client";

const esquema = z
  .object({
    nome: z.string().min(2, "Digite seu nome."),
    email: z.string().email("Digite um e-mail válido."),
    senha: z.string().min(6, "A senha precisa de pelo menos 6 caracteres."),
    confirmar: z.string(),
  })
  .refine((d) => d.senha === d.confirmar, {
    message: "As senhas não são iguais.",
    path: ["confirmar"],
  });

type Dados = z.infer<typeof esquema>;

export function FormularioAceitarConvite({
  token,
  nome,
  email,
}: {
  token: string;
  nome: string;
  email: string;
}) {
  const [erro, setErro] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Dados>({
    resolver: zodResolver(esquema),
    defaultValues: { nome, email, senha: "", confirmar: "" },
  });

  async function aoEnviar(dados: Dados) {
    setErro(null);

    const resp = await fetch("/api/convite/aceitar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        nome: dados.nome,
        email: dados.email,
        senha: dados.senha,
      }),
    });
    const json: { ok: boolean; erro?: string } = await resp.json();
    if (!json.ok) {
      setErro(json.erro ?? "Não consegui concluir. Tente de novo.");
      return;
    }

    // Login imediato (a conta já nasce confirmada) e entra no Pátio. O reload
    // completo leva o cookie de sessão junto (senão o middleware barra).
    const supabase = criarClienteNavegador();
    const { error } = await supabase.auth.signInWithPassword({
      email: dados.email,
      password: dados.senha,
    });
    if (error) {
      setErro("Conta criada, mas não consegui entrar. Vá para o login.");
      return;
    }
    window.location.assign("/funcionario/patio");
  }

  return (
    <form onSubmit={handleSubmit(aoEnviar)} className="space-y-4" noValidate>
      {erro ? (
        <p className="rounded-xl bg-erro-fundo px-3 py-2 text-legenda text-erro">
          {erro}
        </p>
      ) : null}
      <CampoTexto
        label="Seu nome"
        autoComplete="name"
        placeholder="Ex.: Carlos"
        erro={errors.nome?.message}
        {...register("nome")}
      />
      <CampoTexto
        label="E-mail"
        type="email"
        autoComplete="email"
        placeholder="voce@email.com"
        erro={errors.email?.message}
        {...register("email")}
      />
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
        {isSubmitting ? "Entrando..." : "Entrar na equipe"}
      </Button>
    </form>
  );
}
