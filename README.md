# ibc-explorer
IBC dashboard

## Local Dev Requirements
Make sure you have flask, PyYaml, npm installed. Setup K8s port forwarding to

## Build React Frontend

```shell
npm install && npm run build
```

## Run flask app
```shell
python3 app.py
```

## Run via Docker
Alternatively you can run via docker

```shell
docker build -t ibc-explorer .

docker run -e API_URL=tcp://host.docker.internal:8080 -p 5001:5000 ibc-explorer
```
