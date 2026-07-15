FROM node:20-alpine

RUN apk add --no-cache wget

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY src ./src

ENV PORT=3000

EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=3s --retries=3 --start-period=15s \
  CMD wget -qO- http://127.0.0.1:3000/api/ping || exit 1

CMD ["node", "src/server.js"]
