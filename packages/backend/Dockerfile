FROM oven/bun

WORKDIR /app

COPY package.json .
COPY bun.lockb .

RUN bun install --production

COPY src src
COPY config.json .
COPY prisma prisma
COPY tsconfig.json .

RUN bunx prisma generate
RUN bunx prisma db push

ENV NODE_ENV=production
CMD ["bun", "src/index.ts"]

EXPOSE 3001