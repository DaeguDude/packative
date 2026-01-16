FROM node:20-alpine

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy source files
COPY . .

# Expose Express server port
EXPOSE 3000

# Start script: generate prisma client, run migrations, then start dev server
CMD sh -c "npx prisma generate && npx prisma db push && npm run dev"
