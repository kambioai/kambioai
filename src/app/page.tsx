import { redirect } from "next/navigation";

import { rotaPorPapel } from "@/lib/auth/rota-por-papel";
import { criarClienteServidor } from "@/lib/supabase/server";

// Raiz do app. O Kambio é "app-first": quem está logado vai direto pra sua área
// (patrão/funcionário/admin); quem não está vai pro login. (Uma landing de
// marketing pode entrar aqui no futuro, sem mexer no resto.)
export default async function Home() {
  const sb = await criarClienteServidor();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) redirect("/entrar");
  redirect(await rotaPorPapel(sb));
}
