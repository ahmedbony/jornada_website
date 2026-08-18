# Stage 1 — build the React app
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2 — production runtime
FROM node:22-alpine
WORKDIR /app

LABEL name="WAM - Water Adaptation Menu"

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy server and built frontend
COPY server/ ./server/
COPY --from=builder /app/dist ./dist

# Copy seed data (used if the mounted volume is empty on first run)
COPY data/ ./data-seed/

COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

EXPOSE 3001
ENV NODE_ENV=production

CMD ["./docker-entrypoint.sh"]
