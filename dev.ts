import { resolve, join, extname } from "node:path";
import { existsSync, statSync } from "node:fs";
import { readFile } from "node:fs/promises";
import pkg from "./package.json" with { type: "json" };

const root = import.meta.dir;
const publicDir = resolve(root, "public");
const PORT = Number(process.env.PORT ?? 8080);

const transpiler = new Bun.Transpiler({
  loader: "ts",
  target: "browser",
  define: {
    "process.env.npm_package_version": JSON.stringify(pkg.version),
    "process.env.NODE_ENV": JSON.stringify("development"),
  },
});

const staticRoots: Array<{ url: string; dir: string }> = [
  { url: "/styles", dir: resolve(root, "webAO/styles") },
  { url: "/golden", dir: resolve(root, "webAO/golden") },
  { url: "/lib", dir: resolve(root, "webAO/lib") },
  { url: "/", dir: resolve(root, "static") },
];

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".ts": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".opus": "audio/opus",
  ".ogg": "audio/ogg",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
};

function injectScripts(html: string, scripts: string[]): string {
  const tags = scripts
    .map((s) => `    <script type="module" src="${s}"></script>`)
    .join("\n");
  return html.replace("</body>", `${tags}\n  </body>`);
}

async function serveHtml(name: "index" | "client"): Promise<Response> {
  let html = await readFile(resolve(publicDir, `${name}.html`), "utf8");
  if (name === "index") {
    html = html.replace(/<%= htmlWebpackPlugin\.options\.title %>/g, "Attorney Online");
    html = injectScripts(html, ["/webAO/master.ts"]);
  } else {
    html = injectScripts(html, [
      "/webAO/client.ts",
      "/webAO/ui.ts",
      "/webAO/dom-bundle.ts",
      "/webAO/components-bundle.ts",
    ]);
  }
  return new Response(html, { headers: { "Content-Type": MIME[".html"] } });
}

async function serveSourceModule(reqPath: string): Promise<Response | null> {
  // Serve TypeScript modules transpiled on-the-fly so the browser can import them.
  // Bare imports like `import x from "foo"` need to be resolved — for dev convenience
  // we use Bun's built-in bundler instead.
  const absPath = resolve(root, "." + reqPath);
  if (!absPath.startsWith(root) || !existsSync(absPath)) return null;

  const ext = extname(reqPath);
  if (ext === ".ts" || ext === ".tsx" || ext === ".js" || ext === ".mjs") {
    // Bundle from this entry point so transitive imports resolve.
    const built = await Bun.build({
      entrypoints: [absPath],
      target: "browser",
      define: {
        "process.env.npm_package_version": JSON.stringify(pkg.version),
        "process.env.NODE_ENV": JSON.stringify("development"),
      },
    });
    if (!built.success) {
      return new Response(
        `console.error(${JSON.stringify(built.logs.map(String).join("\n"))});`,
        { status: 500, headers: { "Content-Type": MIME[".js"] } },
      );
    }
    const code = await built.outputs[0].text();
    return new Response(code, { headers: { "Content-Type": MIME[".js"] } });
  }
  return null;
}

async function serveStatic(reqPath: string): Promise<Response | null> {
  for (const { url, dir } of staticRoots) {
    if (url === "/" || reqPath.startsWith(url + "/") || reqPath === url) {
      const rel = url === "/" ? reqPath : reqPath.slice(url.length);
      const filePath = join(dir, rel);
      if (existsSync(filePath) && statSync(filePath).isFile()) {
        const file = Bun.file(filePath);
        return new Response(file, {
          headers: { "Content-Type": MIME[extname(filePath)] ?? "application/octet-stream" },
        });
      }
    }
  }
  return null;
}

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname;

    if (path === "/" || path === "/index.html") return serveHtml("index");
    if (path === "/client.html") return serveHtml("client");

    if (path.startsWith("/webAO/")) {
      const r = await serveSourceModule(path);
      if (r) return r;
    }

    const s = await serveStatic(path);
    if (s) return s;

    return new Response("Not found", { status: 404 });
  },
});

console.log(`[dev] http://localhost:${server.port}`);
