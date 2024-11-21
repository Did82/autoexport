# FROM oven/bun
FROM imbios/bun-node:latest
ENV TURBO_TELEMETRY_DISABLED=1
ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app

COPY . .

RUN bun install

RUN bun run build

ENV NODE_ENV=production
ENV SRC_PATH=/mnt/ftp
ENV TRG_PATH=/mnt/smb

CMD ["bun", "run", "start"]

