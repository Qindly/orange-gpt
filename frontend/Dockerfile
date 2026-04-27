# 1. 构建产物
FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install
RUN ls node_modules/typescript/bin/  
COPY . .
RUN pnpm run build

# 2. 生产环境
FROM nginx:alpine
# 下面的内容是将构建产物复制到 nginx 的默认静态文件目录，并替换默认的 nginx 配置文件
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
