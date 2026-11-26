// scripts/promover-admin.mjs — promove uma conta a ADMIN do SaaS (dono do Kambio).
//
// O admin é o dono do SaaS (CLAUDE.md §1/§11): enxerga o painel admin e, só em
// modo suporte (registrado), os dados das oficinas. Conceder admin é uma ação
// sensível — por isso fica num script que VOCÊ roda, não no app.
//
// Uso (na raiz do projeto, com .env.local preenchido):
//   node scripts/promover-admin.mjs "oficina do zaia"      # pelo nome da oficina (vira admin o patrão dela)
//   node scripts/promover-admin.mjs --email voce@email.com # por e-mail (se o membro tiver e-mail)
//
// Reversível: para remover, apague a linha em `admins` no painel do Supabase.

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);

const sb = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);

const arg = process.argv[2];
if (!arg) {
  console.error('Uso: node scripts/promover-admin.mjs "<nome da oficina>" | --email <email>');
  process.exit(1);
}

let usuarioId = null;
let nome = "Admin Kambio";

if (arg === "--email") {
  const email = process.argv[3];
  const { data } = await sb
    .from("membros")
    .select("usuario_id, nome")
    .ilike("email", email)
    .limit(1)
    .maybeSingle();
  if (!data?.usuario_id) {
    console.error("Não achei um membro com esse e-mail. Tente pelo nome da oficina.");
    process.exit(1);
  }
  usuarioId = data.usuario_id;
  nome = data.nome ?? nome;
} else {
  const { data: emp } = await sb
    .from("empresas")
    .select("id, nome")
    .ilike("nome", arg)
    .limit(1)
    .maybeSingle();
  if (!emp) {
    console.error(`Não achei a oficina "${arg}".`);
    process.exit(1);
  }
  const { data: pat } = await sb
    .from("membros")
    .select("usuario_id, nome")
    .eq("empresa_id", emp.id)
    .eq("papel", "patrao")
    .eq("ativo", true)
    .limit(1)
    .maybeSingle();
  if (!pat?.usuario_id) {
    console.error("Não achei o patrão ativo dessa oficina.");
    process.exit(1);
  }
  usuarioId = pat.usuario_id;
  nome = pat.nome ?? nome;
}

const { error } = await sb
  .from("admins")
  .upsert({ usuario_id: usuarioId, nome }, { onConflict: "usuario_id" });
if (error) {
  console.error("Falhou ao promover:", error.message);
  process.exit(1);
}
console.log(`OK: ${nome} agora é admin do Kambio. Entre em /admin.`);
