FROM node:18-alpine

# Create app directory
WORKDIR /app

# Copy package manifests first for caching
COPY package*.json ./

# Install production dependencies
RUN npm ci --omit=dev

# Copy application code
COPY . .

ENV NODE_ENV=production

EXPOSE 3000

# Start the app
CMD ["node", "src/main.js"]
