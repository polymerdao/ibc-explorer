# ibc-explorer
IBC Dashboard

## Local Dev Requirements
Install Node and NPM. Install Docker to test production deployment images.

## Build React Frontend

```shell
cd ibc-explorer
npm install
npm run dev
```

## Run via Docker
Alternatively you can run via Docker:

```shell
docker build -t ibc-explorer .

docker run -e API_URL=http://host.docker.internal:8080 -p 5001:5000 ibc-explorer
```

## E2E Testing
To run tests on a development server using the Cypress GUI:
```shell
npm run test
```

To run tests on a production build in headless mode:
```shell
npm run build
npm run test:headless
```

(All tests are designed to use production GraphQL and chain-registry)
