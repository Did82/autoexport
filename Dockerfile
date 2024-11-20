FROM oven/bun

WORKDIR /app

COPY package.json .
COPY bun.lockb .

RUN bun install

COPY . .

RUN bun run build

ENV NODE_ENV=production
ENV SRC_PATH=/mnt/ftp
ENV TRG_PATH=/mnt/smb

CMD ["bun", "run", "start"]

