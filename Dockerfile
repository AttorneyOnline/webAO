FROM oven/bun:1
WORKDIR /usr/src/app

RUN bun install
COPY . .

ENV NODE_ENV=production
RUN bun test
RUN bun run build

# run the app
USER bun
EXPOSE 8080/tcp
ENTRYPOINT [ "bun", "run", "start" ]
