# Backend API image
FROM node:20-alpine

WORKDIR /app

# Install dependencies first for better layer caching
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source
COPY . .

# Data/log directories for the SQLite MVP
RUN mkdir -p data logs

ENV NODE_ENV=production
EXPOSE 5000

CMD ["node", "src/server.js"]
