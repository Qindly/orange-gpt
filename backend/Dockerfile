FROM node:22-alpine
WORKDIR /app

# 安装 OpenSSL（Prisma 需要）
RUN apk add --no-cache openssl

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .

# 生成 Prisma Client
RUN npx prisma generate

# 编译 TypeScript
RUN pnpm build

EXPOSE 3000

# 启动时先执行数据库迁移，再启动应用
CMD npx prisma migrate deploy && node dist/main.js