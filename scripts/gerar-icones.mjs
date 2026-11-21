// Gera os PNGs do PWA a partir de public/icons/icon.svg usando sharp.
// Uso: npm run gerar-icones
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import sharp from "sharp";

const aqui = dirname(fileURLToPath(import.meta.url));
const pastaIcones = join(aqui, "..", "public", "icons");
const svg = await readFile(join(pastaIcones, "icon.svg"));

/** @type {{nome: string, tamanho: number, maskable?: boolean}[]} */
const alvos = [
  { nome: "icon-192.png", tamanho: 192 },
  { nome: "icon-512.png", tamanho: 512 },
  { nome: "icon-maskable-512.png", tamanho: 512, maskable: true },
  { nome: "apple-touch-icon.png", tamanho: 180 },
];

for (const alvo of alvos) {
  // Maskable: margem de segurança (~10%) com fundo marinho para não cortar o "K".
  if (alvo.maskable) {
    const interno = Math.round(alvo.tamanho * 0.8);
    const margem = Math.round((alvo.tamanho - interno) / 2);
    const miolo = await sharp(svg).resize(interno, interno).png().toBuffer();
    await sharp({
      create: {
        width: alvo.tamanho,
        height: alvo.tamanho,
        channels: 4,
        background: "#0F2A4A",
      },
    })
      .composite([{ input: miolo, top: margem, left: margem }])
      .png()
      .toFile(join(pastaIcones, alvo.nome));
  } else {
    await sharp(svg)
      .resize(alvo.tamanho, alvo.tamanho)
      .png()
      .toFile(join(pastaIcones, alvo.nome));
  }
  console.log("gerado:", alvo.nome);
}
