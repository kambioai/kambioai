"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { CampoTexto } from "@/components/auth/campo-texto";
import { Button } from "@/components/ui/button";
import { criarClienteNavegador } from "@/lib/supabase/client";

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

type Estado = "verificando" | "pronto" | "sem-sessao" | "ok";

export function FormularioRedefinir() {
  const [estado, setEstado] = useState<Estado>("verificando");
  const [erro, setErro] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Dados>({ resolver: zodResolver(esquema) });

  // Ao cair aqui vindo do link, o cliente do Supabase troca o código da URL por
  // uma sessão automaticamente (detectSessionInUrl). Isso é assíncrono, então
  // escutamos o evento de login; se em alguns segundos nada aparecer, o link é
  // inválido ou já expirou.
  useEffect(() => {
    const supabase = criarClienteNavegador();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_evento, sessao) => {
      if (sessao) setEstado("pronto");
    });

    // Cobre o caso de a sessão já existir (recarregar a página, p. ex.).
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setEstado("pronto");
    });

    const prazo = setTimeout(() => {
      setEstado((e) => (e === "verificando" ? "sem-sessao" : e));
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(prazo);
    };
  }, []);

  async function aoEnviar(dados: Dados) {
    setErro(null);
    const supabase = criarClienteNavegador();
    const { error } = await supabase.auth.updateUser({ password: dados.senha });
    if (error) {
      setErro("Não deu pra salvar a senha. Tente de novo.");
      return;
    }
    setEstado("ok");
    // Já está logado com a sessão de recuperação: manda para a própria área.
    setTimeout(() => window.location.assign("/"), 1500);
  }

  if (estado === "verificando") {
    return (
      <div className="space-y-4" aria-busy="true">
        <div className="h-5 w-32 animate-pulse rounded bg-linha" />
        <div className="h-12 w-full animate-pulse rounded-xl bg-linha" />
        <div className="h-12 w-full animate-pulse rounded-xl bg-linha" />
        <div className="h-[52px] w-full animate-pulse rounded-xl bg-linha" />
      </div>
    );
  }

  if (estado === "sem-sessao") {
    return (
      <div className="space-y-4 text-center">
        <p className="text-corpo text-texto">
          Esse link de recuperação é inválido ou já expirou. Peça um novo para
          continuar.
        </p>
        <Button asChild className="w-full">
          <Link href="/recuperar-senha">Pedir novo link</Link>
        </Button>
      </div>
    );
  }

  if (estado === "ok") {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="grid h-14 w-14 place-items-center rounded-full bg-confirmado/10 text-confirmado">
          <CheckCircle2 className="h-7 w-7" strokeWidth={2} aria-hidden="true" />
        </div>
        <p className="text-corpo text-texto">
          Senha alterada! Entrando na sua conta…
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
        label="Senha nova"
        type="password"
        autoComplete="new-password"
        placeholder="Crie uma senha"
        erro={errors.senha?.message}
        {...register("senha")}
      />
      <CampoTexto
        label="Confirmar senha"
        type="password"
        autoComplete="new-password"
        placeholder="Repita a senha"
        erro={errors.confirmar?.message}
        {...register("confirmar")}
      />
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Salvando..." : "Salvar senha nova"}
      </Button>
    </form>
  );
}
