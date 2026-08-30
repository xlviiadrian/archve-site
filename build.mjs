import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const source = join(root, "website");
const dist = join(root, "dist");

if (!existsSync(source)) throw new Error("Missing website source directory");
rmSync(dist, { recursive: true, force: true });
mkdirSync(join(dist, "server"), { recursive: true });
cpSync(source, dist, { recursive: true });
writeFileSync(
  join(dist, "server", "index.js"),
  `export default {\n  async fetch(request, env) {\n    if (env && env.ASSETS && typeof env.ASSETS.fetch === "function") {\n      return env.ASSETS.fetch(request);\n    }\n    return new Response("ARCHVE Magazine", { headers: { "content-type": "text/plain; charset=utf-8" } });\n  }\n};\n`
);
