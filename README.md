# ibc-explorer
IBC dashboard

## Local Dev Requirements
Make sure you have npm and docker installed.

## Build React Frontend

```shell
npm install && npm run build
```

## Run locally

```shell
export API_URL=http://localhost:8080
export DISPATCHER_ADDRESS_OPTIMISM=0x82B4543D23dd102E0D13508019d510AF35dbe6b2
export DISPATCHER_ADDRESS_BASE=0x756C7B2525E926ad8CAe3124E220B64D44D3e4d2
npm run dev
```

## Run via Docker
You can run via docker

```shell
docker build -t ibc-explorer .

docker run -e API_URL=http://host.docker.internal:8080 -e DISPATCHER_ADDRESS_OPTIMISM=... -e DISPATCHER_ADDRESS_BASE=... -p 5001:5000 ibc-explorer
```
