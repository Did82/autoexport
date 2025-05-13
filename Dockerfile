# FROM oven/bun
FROM imbios/bun-node:latest as builder
ENV TURBO_TELEMETRY_DISABLED=1
ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app

COPY . .

RUN bun install

RUN bun run build

FROM oven/bun:alpine as runner

WORKDIR /app

COPY --from=builder /app .
# COPY --from=builder /app/packages/backend ./packages/backend
# COPY --from=builder /app/packages/frontend/.next/standalone ./.next/standalone
# COPY --from=builder /app/packages/frontend/.next/static ./.next/static

EXPOSE 3000

ENV NODE_ENV=production
ENV TURBO_TELEMETRY_DISABLED=1
ENV NEXT_TELEMETRY_DISABLED=1

CMD ["bun", "run", "start"]

