# LemmyAO

A forked client of WebAO for the Attorney Online roleplaying chatroom, written in TypeScript. Works with any AO server that supports WebSockets.

**Live Client:** [https://webao.miku.pizza/](https://webao.miku.pizza/)

## Prerequisites

- [Bun](https://bun.sh) — runtime, bundler, test runner

## Local development

```bash
# Install dependencies
bun install

# Start the dev server (hot reload, http://localhost:8080)
bun run start

# Run the test suite
bun test

# Produce a production build in ./dist
bun run build
```

You can also invoke the scripts directly: `bun dev.ts`, `bun build.ts`.

## Docker

```bash
docker build -t webao .
docker run -d -it -p 8080:8080 webao
```
