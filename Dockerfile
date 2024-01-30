FROM node:21-alpine3.18

WORKDIR /app
COPY . .

ENV NODE_ENV=production

RUN npm ci

RUN npm run build

RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

RUN chown -R appuser:appgroup /app .

EXPOSE 3000

USER appuser
CMD npm start
