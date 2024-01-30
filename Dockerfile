FROM ghcr.io/polymerdao/polymer:v0.1.0-alpha.12
RUN apk add --update --no-cache nodejs npm git

WORKDIR /app
COPY package*.json ./
ENV NODE_ENV=production
RUN npm ci
COPY . .

RUN npm run build

RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup
RUN chown -R appuser:appgroup /app .

EXPOSE 3000

USER appuser
CMD npm start
