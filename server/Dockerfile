FROM oven/bun:1-alpine
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install
COPY . .
RUN bunx prisma generate
RUN chmod +x start.sh
EXPOSE 4000
CMD ["./start.sh"]
