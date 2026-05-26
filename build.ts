import { rm, mkdir, cp, readFile, writeFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve, basename, dirname, join } from "node:path";
import pkg from "./package.json" with { type: "json" };

const root = import.meta.dir;
const outDir = resolve(root, "dist");
const publicDir = resolve(root, "public");

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

const entrypoints: Record<string, string> = {
  client: resolve(root, "webAO/client.ts"),
  ui: resolve(root, "webAO/ui.ts"),
  master: resolve(root, "webAO/master.ts"),
  dom: resolve(root, "webAO/dom-bundle.ts"),
  components: resolve(root, "webAO/components-bundle.ts"),
};

console.log("[build] bundling JS...");
const result = await Bun.build({
  entrypoints: Object.values(entrypoints),
  outdir: outDir,
  target: "browser",
  splitting: true,
  sourcemap: "linked",
  minify: { syntax: true, whitespace: true, identifiers: false },
  naming: {
    entry: "[name]-[hash].js",
    chunk: "chunk-[hash].js",
    asset: "[name]-[hash].[ext]",
  },
  define: {
    "process.env.npm_package_version": JSON.stringify(pkg.version),
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV ?? "production"),
  },
});

if (!result.success) {
  console.error("[build] failed:");
  for (const msg of result.logs) console.error(msg);
  process.exit(1);
}

const entryFor: Record<string, string> = {};
for (const [name] of Object.entries(entrypoints)) {
  const expectedPrefix = name === "dom" || name === "components" ? `${name}-bundle-` : `${name}-`;
  const artifact = result.outputs.find(
    (a) => a.kind === "entry-point" && basename(a.path).startsWith(expectedPrefix),
  );
  if (!artifact) {
    console.error(`[build] missing entry output for ${name}`);
    process.exit(1);
  }
  entryFor[name] = basename(artifact.path);
}

console.log("[build] entries:", entryFor);

const scriptTag = (file: string): string =>
  `    <script type="module" src="${file}"></script>`;

console.log("[build] rendering HTML...");
const indexHtml = (await readFile(resolve(publicDir, "index.html"), "utf8"))
  .replace(/<%= htmlWebpackPlugin\.options\.title %>/g, "Attorney Online")
  .replace(
    "</body>",
    `${scriptTag(entryFor.master)}\n  </body>`,
  );
await writeFile(resolve(outDir, "index.html"), indexHtml);

const clientScripts = [
  scriptTag(entryFor.client),
  scriptTag(entryFor.ui),
  scriptTag(entryFor.dom),
  scriptTag(entryFor.components),
].join("\n");
const clientHtml = (await readFile(resolve(publicDir, "client.html"), "utf8")).replace(
  "</body>",
  `${clientScripts}\n  </body>`,
);
await writeFile(resolve(outDir, "client.html"), clientHtml);

console.log("[build] copying assets...");
const copies: [string, string][] = [
  [resolve(root, "webAO/styles"), resolve(outDir, "styles")],
  [resolve(root, "static"), outDir],
  [resolve(root, "webAO/golden"), resolve(outDir, "golden")],
  [resolve(root, "webAO/lib"), resolve(outDir, "lib")],
];
for (const [from, to] of copies) {
  if (!existsSync(from)) continue;
  await cp(from, to, { recursive: true });
}

console.log(`[build] done — output in ${outDir}`);
