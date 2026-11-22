import "server-only";

import { GoogleGenAI } from "@google/genai";

import { validarRespostaIa, type RespostaIa } from "./schema";

// Cliente Gemini (CLAUDE.md §6). Só servidor — usa GEMINI_API_KEY.
// O modelo é configurável por env; confirmamos o id exato ao testar com a chave.
const MODELO = process.env.GEMINI_MODELO ?? "gemini-3.1-flash-lite";

export interface UsoIa {
  tokensEntrada: number;
  tokensSaida: number;
}

export type ResultadoIa =
  | { ok: true; dados: RespostaIa; uso: UsoIa }
  | { ok: false; erro: string };

function cliente(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY não configurada.");
  return new GoogleGenAI({ apiKey });
}

interface Parte {
  text?: string;
  inlineData?: { mimeType: string; data: string };
}

async function gerar(partes: Parte[]): Promise<ResultadoIa> {
  const ai = cliente();

  async function umaTentativa(): Promise<ResultadoIa> {
    const resp = await ai.models.generateContent({
      model: MODELO,
      contents: [{ role: "user", parts: partes }],
      config: { responseMimeType: "application/json", temperature: 0 },
    });
    const texto = resp.text ?? "";
    let bruto: unknown;
    try {
      bruto = JSON.parse(texto);
    } catch {
      return { ok: false, erro: "A IA não devolveu JSON válido." };
    }
    const v = validarRespostaIa(bruto);
    if (!v.ok) return { ok: false, erro: v.erro };
    const meta = resp.usageMetadata;
    return {
      ok: true,
      dados: v.dados,
      uso: {
        tokensEntrada: meta?.promptTokenCount ?? 0,
        tokensSaida: meta?.candidatesTokenCount ?? 0,
      },
    };
  }

  // Tenta 1 vez; se falhar, repete 1 vez (CLAUDE.md §6).
  try {
    const r = await umaTentativa();
    if (r.ok) return r;
    return await umaTentativa();
  } catch (e) {
    try {
      return await umaTentativa();
    } catch {
      return {
        ok: false,
        erro: e instanceof Error ? e.message : "Falha ao chamar a IA.",
      };
    }
  }
}

/** Interpreta um áudio (base64) + prompt de contexto. */
export function interpretarAudio(params: {
  audioBase64: string;
  mimeType: string;
  prompt: string;
}): Promise<ResultadoIa> {
  return gerar([
    { text: params.prompt },
    { inlineData: { mimeType: params.mimeType, data: params.audioBase64 } },
  ]);
}

/** Interpreta um texto digitado + prompt de contexto. */
export function interpretarTexto(params: {
  texto: string;
  prompt: string;
}): Promise<ResultadoIa> {
  return gerar([
    { text: params.prompt },
    { text: `\n\nFrase do usuário:\n${params.texto}` },
  ]);
}
