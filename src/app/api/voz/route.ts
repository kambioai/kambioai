import { NextResponse } from "next/server";

import { interpretarAudio, interpretarTexto } from "@/lib/ia/cliente";
import { montarPrompt } from "@/lib/ia/prompt";
import { criarClienteServico } from "@/lib/supabase/service";
import {
  carregarContexto,
  intentDaResposta,
  processar,
} from "@/server/voz-core";

// POST /api/voz — recebe áudio (FormData "audio") OU texto (FormData "texto"),
// interpreta no Gemini, calcula no servidor e devolve o cartão de confirmação.
export async function POST(req: Request) {
  const ctx = await carregarContexto();
  if (!ctx) {
    return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
  }

  const form = await req.formData();
  const texto = form.get("texto");
  const audio = form.get("audio");

  const prompt = montarPrompt({
    papel: ctx.papel,
    catalogo: ctx.itensContexto,
    veiculosRecentes: ctx.veiculos,
    agoraISO: new Date().toLocaleString("sv-SE", {
      timeZone: "America/Sao_Paulo",
    }),
  });

  const r =
    typeof texto === "string" && texto.trim() !== ""
      ? await interpretarTexto({ texto, prompt })
      : audio instanceof File
        ? await interpretarAudio({
            audioBase64: Buffer.from(await audio.arrayBuffer()).toString(
              "base64",
            ),
            mimeType: audio.type || "audio/webm",
            prompt,
          })
        : null;

  if (r === null) {
    return NextResponse.json({ erro: "Envie áudio ou texto." }, { status: 400 });
  }
  if (!r.ok) {
    return NextResponse.json(
      { erro: "Não entendi. Tente de novo ou digite." },
      { status: 502 },
    );
  }

  // registra o uso da IA (servidor; uso_ia não é acessível pelo app)
  try {
    await criarClienteServico()
      .from("uso_ia")
      .insert({
        empresa_id: ctx.empresaId,
        tokens_entrada: r.uso.tokensEntrada,
        tokens_saida: r.uso.tokensSaida,
        custo: 0,
        corrigido: false,
      });
  } catch {
    // não bloqueia o fluxo se o log falhar
  }

  const intent = intentDaResposta(r.dados);
  const { cartao } = processar(ctx, intent);
  return NextResponse.json({ cartao });
}
