FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
# --include=dev ensures devDependencies (e.g. @nestjs/cli) are installed even if NODE_ENV=production
RUN npm ci --include=dev
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
EXPOSE 4000
CMD ["node", "dist/main"]
