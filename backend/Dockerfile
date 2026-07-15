# Multi-stage build for backend
FROM node:20-alpine AS builder

WORKDIR /app

# Install build essentials for native modules (e.g. bcrypt) if required
RUN apk add --no-cache make gcc g++ python3

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies (including devDependencies for prisma client generation)
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

# Copy source code
COPY . .

# Release stage
FROM node:20-alpine AS runner

WORKDIR /app

# Install runtime dependencies if needed
RUN apk add --no-cache curl

ENV NODE_ENV=production

# Copy built artifacts from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY --from=builder /app/prisma ./prisma

# Create uploads directory and set permissions
RUN mkdir -p uploads/images uploads/invoices && chown -R node:node /app

USER node

EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:4000/ || exit 1

CMD ["npm", "start"]
