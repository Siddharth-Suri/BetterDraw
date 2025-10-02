# Base Image
FROM node:24-alpine AS base

# Enable pnpm
RUN corepack enable
RUN apk add --no-cache python3 make g++ git

WORKDIR /BetterDraw

# Copy 
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY . .

# Run 
RUN pnpm install --frozen-lockfile

# Generate
WORKDIR /BetterDraw/packages/db
RUN npx prisma generate --schema=./prisma/schema.prisma

WORKDIR /BetterDraw
EXPOSE 3000 8080 3002

# Command 
CMD ["pnpm", "run", "dev"]
