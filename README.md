# ibc-explorer
IBC dashboard

## Local Dev Requirements
Make sure you have npm and docker installed. 

## Build React Frontend

```shell
npm install && npm run build
```

## Run via Docker
You can run via docker

```shell
docker build -t ibc-explorer .

docker run -e API_URL=tcp://host.docker.internal:8080 -p 5001:5000 ibc-explorer
```
