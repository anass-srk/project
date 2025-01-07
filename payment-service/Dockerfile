FROM node:20-bullseye

WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci
RUN npx prisma generate

# Copy source code
COPY . .

EXPOSE 3003

ENV NODE_ENV=production

CMD ["npm", "start"]