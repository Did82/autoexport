# FROM oven/bun
FROM imbios/bun-node:latest as builder
ENV TURBO_TELEMETRY_DISABLED=1
ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app

COPY . .

RUN bun install

RUN cd packages/backend && bunx prisma generate

RUN bun run build

FROM oven/bun:alpine as runner

# Устанавливаем пакет tzdata
RUN apk add --no-cache tzdata

# Устанавливаем часовой пояс, например, Europe/Moscow
ENV TZ=Europe/Moscow

WORKDIR /app

# Copy necessary files
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/bun.lockb ./bun.lockb
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/node_modules ./node_modules

ENV NODE_ENV=production
ENV TURBO_TELEMETRY_DISABLED=1
ENV NEXT_TELEMETRY_DISABLED=1

# Generate Prisma client in the final stage
# RUN cd packages/backend && bunx prisma generate

EXPOSE 3000

CMD ["bun", "run", "start"]
