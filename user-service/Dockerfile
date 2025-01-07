# Use Node.js Alpine as base image
FROM node:20-bullseye

# Set working directory
WORKDIR /app

# Install dependencies first (for better caching)
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Expose service port
EXPOSE 3001

# Set environment variables
ENV NODE_ENV=production

# Start the service
CMD ["npm", "start"]