"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { CampoTexto } from "@/components/auth/campo-texto";
import { Button } from "@/components/ui/button";
import { rotaPorPapel } from "@/lib/auth/rota-por-papel";
import { criarClienteNavegador } from "@/lib/supabase/client";

const esquema = z.object({
  email: z.string().email("Digite um e-mail válido."),
  senha: z.string().min(1, "Digite sua senha."),
});

type Dados = z.infer<typeof esquema>;

export function FormularioEntrar() {
  const [erro, setErro] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Dados>({ resolver: zodResolver(esquema) });

  async function aoEnviar(dados: Dados) {
    setErro(null);
    const supabase = criarClienteNavegador();
    const { error } = await supabase.auth.signInWithPassword({
      email: dados.email,
      password: dados.senha,
    });
    if (error) {
      setErro("E-mail ou senha incorretos.");
      return;
    }
    const rota = await rotaPorPapel(supabase);
    // Navegação com recarregamento completo: garante que o cookie de sessão
    // recém-gravado acompanhe a requisição, evitando que o middleware ache que
    // ainda não há login e devolva para esta tela.
    window.location.assign(rota);
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
        {isSubmitting ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
}
