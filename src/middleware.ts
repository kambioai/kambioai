import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Middleware de sessão + proteção de rotas (CLAUDE.md §3).
 * - Renova a sessão do Supabase a cada request (cookies).
 * - Bloqueia as áreas de patrão, funcionário e admin para quem não está logado
 *   (a checagem de QUE o usuário é admin fica no layout do admin, via DB).
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !chave) return response;

  const supabase = createServerClient(url, chave, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const protegidas = ["/patrao", "/funcionario", "/comecar", "/admin"];
  const precisaLogin = protegidas.some((p) =>
    request.nextUrl.pathname.startsWith(p),
  );

  if (precisaLogin && !user) {
    const destino = request.nextUrl.clone();
    destino.pathname = "/entrar";
    return NextResponse.redirect(destino);
  }

  return response;
}

export const config = {
  matcher: ["/patrao/:path*", "/funcionario/:path*", "/comecar", "/admin/:path*"],
};
