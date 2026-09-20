import { copyFileSync, cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const output = resolve(root, ".output");
const dist = resolve(root, "dist");

if (!existsSync(resolve(output, "server/index.mjs"))) {
  throw new Error("Nitro server output is missing. Run this script after vite build.");
}

rmSync(dist, { recursive: true, force: true });
mkdirSync(resolve(dist, "server"), { recursive: true });

cpSync(resolve(output, "server"), resolve(dist, "server"), { recursive: true });
copyFileSync(resolve(output, "server/index.mjs"), resolve(dist, "server/index.js"));

if (existsSync(resolve(output, "public"))) {
  cpSync(resolve(output, "public"), resolve(dist, "public"), { recursive: true });
  cpSync(resolve(output, "public"), resolve(dist, "client"), { recursive: true });
}
