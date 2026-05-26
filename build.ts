import { rm, cp } from "node:fs/promises";
import pkg from "./package.json" with { type: "json" };

await rm("./dist", { recursive: true, force: true });

// Copy public/ first so dynamically-loaded assets (theme CSS, audio, fonts,
// chatbox skins) are present at their original paths. Bun.build then writes
// the bundled HTML/JS/CSS on top, replacing entrypoint files with hashed
// versions while leaving runtime-loaded assets untouched.
await cp("./public", "./dist", { recursive: true });

const result = await Bun.build({
  entrypoints: ["./public/index.html", "./public/client.html"],
  outdir: "./dist",
  target: "browser",
  minify: true,
  sourcemap: "linked",
  define: {
    "process.env.npm_package_version": JSON.stringify(pkg.version),
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
});

if (!result.success) {
  for (const msg of result.logs) console.error(msg);
  process.exit(1);
}

console.log(`✓ built ${result.outputs.length} files → ./dist`);
