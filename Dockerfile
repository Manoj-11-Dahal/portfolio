FROM node:20-alpine AS app

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

RUN npm run generate:model && npm run copy:motion

EXPOSE 3000

CMD ["node", "server.js"]
