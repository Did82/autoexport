FROM oven/bun

WORKDIR /app

COPY package.json .
COPY bun.lockb .

RUN bun install

COPY src src
COPY config.json .
COPY prisma prisma
COPY tsconfig.json .

RUN bunx prisma generate

ENV NODE_ENV=production
CMD ["bun", "src/index.ts"]

EXPOSE 3001