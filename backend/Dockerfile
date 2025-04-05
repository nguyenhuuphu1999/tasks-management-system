FROM node:18-alpine
WORKDIR /app

# Install build tools for compiling bcrypt
RUN apk add --no-cache python3 make g++ linux-headers

COPY package*.json ./
RUN npm install pnpm -g
RUN pnpm install
COPY . .
COPY .env.example .env

RUN npm run build
ENTRYPOINT ["./entrypoint.sh"]
EXPOSE 3000