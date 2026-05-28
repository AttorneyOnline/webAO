import { rm, cp } from "node:fs/promises";

await rm("./dist", { recursive: true, force: true });

// Copy public/ first so dynamically-loaded assets (theme CSS, audio, fonts,
// chatbox skins) land at their original paths. Bun.build then writes the
// bundled HTML/JS/CSS on top of the entrypoint files, while leaving
// runtime-loaded assets untouched.
await cp("./public", "./dist", { recursive: true });

const result = await Bun.build({
  entrypoints: ["./public/index.html", "./public/client.html"],
  outdir: "./dist",
  target: "browser",
  minify: true,
  sourcemap: "linked",
});

if (!result.success) {
  for (const msg of result.logs) console.error(msg);
  process.exit(1);
}

console.log(`✓ built ${result.outputs.length} files -> ./dist`);
