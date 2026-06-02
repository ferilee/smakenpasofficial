FROM oven/bun:1 AS deps

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM oven/bun:1

WORKDIR /app

COPY --from=deps /app/node_modules /app/node_modules
COPY . .

ENV PORT=2005
EXPOSE 2005

CMD ["bun", "src/server.ts"]
