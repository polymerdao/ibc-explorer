FROM ghcr.io/polymerdao/polymer:v0.1.0-alpha.10

RUN apk add --update --no-cache nodejs npm py3-flask py3-yaml git

COPY . .

RUN npm install && npm run build

EXPOSE 5000

CMD ["python3", "app.py"]
