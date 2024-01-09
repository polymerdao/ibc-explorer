FROM ghcr.io/polymerdao/polymer:v0.1.0-alpha.14-hotfix-4

RUN apk add --update --no-cache nodejs npm git

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]