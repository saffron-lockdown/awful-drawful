# drawful-clone

A clone of Drawful using express, socket.io and Vue.js.

## Getting started

```sh
npm install
npm run dev
```

## Running in production

```sh
npm run build
npm start
```

## Development

Set runtime environment variables for development by creating a `.env` file in the root of the
project. E.g.

```sh
DEBUG=app*
DEFAULT_COUNTDOWN=5
```

A game for testing is always created with the id `ABCD`. Unlike other rooms, won't be destroyed
when there are no players left.

## Unit tests

To run unit tests:

```sh
npm run test
```

## Integration tests

Tests are located in `cypress/integration`.

To run integration tests:

```sh
npm run test:integration
```
