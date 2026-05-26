import index from "./public/index.html";
import client from "./public/client.html";

const server = Bun.serve({
  port: Number(process.env.PORT ?? 8080),
  routes: {
    "/": index,
    "/index.html": index,
    "/client.html": client,
  },
  // Fallback for runtime-loaded assets (theme CSS, audio, fonts, etc.)
  async fetch(req) {
    const url = new URL(req.url);
    const file = Bun.file(`./public${url.pathname}`);
    return (await file.exists())
      ? new Response(file)
      : new Response("Not found", { status: 404 });
  },
  development: {
    hmr: true,
    console: true,
  },
});

console.log(`[dev] http://localhost:${server.port}`);
