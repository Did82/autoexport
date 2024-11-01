# Этап сборки
# FROM node:20-alpine AS builder
FROM oven/bun:alpine AS builder

# Установка зависимостей для сборки
# RUN apk add --no-cache libc6-compat

# Создание директории приложения
WORKDIR /app

# Копирование файлов package.json и package-lock.json
COPY package*.json ./
COPY bun.lockb ./

# Установка зависимостей
# RUN npm ci
RUN bun install

# Копирование исходного кода
COPY . .

# Сборка приложения
# RUN npm run build
RUN bun run build
# Этап production
# FROM node:20-alpine AS runner
FROM oven/bun:alpine AS runner

WORKDIR /app

# Установка необходимых пакетов
# RUN apk add --no-cache libc6-compat

# Создание пользователя nextjs
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Копирование необходимых файлов из этапа сборки
# COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Установка прав для nextjs пользователя
RUN chown -R nextjs:nodejs /app

# Переключение на пользователя nextjs
USER nextjs

# Открытие порта
EXPOSE 3000

# Установка переменных окружения
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Запуск приложения
# CMD ["node", "server.js"]
CMD ["bun", "server.js"]
