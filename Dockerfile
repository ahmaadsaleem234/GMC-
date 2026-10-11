FROM node:22-bookworm-slim

WORKDIR /app

COPY package*.json ./
RUN NODE_ENV=development npm install --include=dev --legacy-peer-deps

COPY . .
RUN npm run build

ENV NODE_ENV=production

EXPOSE 3000

CMD ["npm", "run", "start"]
