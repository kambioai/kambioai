"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { CampoTexto } from "@/components/auth/campo-texto";
import { Button } from "@/components/ui/button";
import { criarClienteNavegador } from "@/lib/supabase/client";

const esquema = z.object({
  nome: z.string().min(2, "Digite seu nome."),
  celular: z.string().min(10, "Digite um celular com DDD."),
  email: z.string().email("Digite um e-mail válido."),
  senha: z.string().min(6, "A senha precisa de pelo menos 6 caracteres."),
});

type Dados = z.infer<typeof esquema>;

export function FormularioCriarConta() {
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Dados>({ resolver: zodResolver(esquema) });

  async function aoEnviar(dados: Dados) {
    setErro(null);
    setAviso(null);
    const supabase = criarClienteNavegador();
    const { data, error } = await supabase.auth.signUp({
      email: dados.email,
      password: dados.senha,
      options: { data: { nome: dados.nome, celular: dados.celular } },
    });
    if (error) {
      setErro(error.message);
      return;
    }
    if (!data.session) {
      // Confirmação de e-mail ligada: não há sessão ainda.
      setAviso(
        "Conta criada! Confirme pelo link que enviamos no seu e-mail para entrar.",
      );
      return;
    }
    // Vai para o onboarding real: lá o patrão cria a PRÓPRIA oficina e configura
    // catálogo, estoque, custos e taxas. Recarregamento completo leva o cookie
    // de sessão junto (senão o middleware acha que ainda não há login).
    window.location.assign("/comecar");
  }

  return (
    <form onSubmit={handleSubmit(aoEnviar)} className="space-y-4" noValidate>
      {erro ? (
        <p className="rounded-xl bg-erro-fundo px-3 py-2 text-legenda text-erro">
          {erro}
        </p>
      ) : null}
      {aviso ? (
        <p className="rounded-xl bg-atencao-fundo px-3 py-2 text-legenda text-atencao">
          {aviso}
        </p>
      ) : null}
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
        {isSubmitting ? "Criando..." : "Criar conta"}
      </Button>
    </form>
  );
}
