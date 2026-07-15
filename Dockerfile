# Build stage
FROM node:20-alpine AS build
WORKDIR /app

COPY frontend/package*.json ./
RUN npm install

ARG VITE_NAVER_MAP_CLIENT_ID
ENV VITE_NAVER_MAP_CLIENT_ID=$VITE_NAVER_MAP_CLIENT_ID

COPY frontend/ ./
RUN npm run build

# Runtime stage
FROM alpine:latest

RUN apk add --no-cache nginx wget \
    && mkdir -p /run/nginx \
    && rm -f /etc/nginx/http.d/default.conf

COPY nginx/default.conf /etc/nginx/http.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=10s --timeout=3s --retries=3 --start-period=5s \
  CMD wget -qO- http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
