[![Environment Tests](https://github.com/dsp-krabby/server/actions/workflows/CI-Tests.yml/badge.svg?branch=main)](https://github.com/dsp-krabby/server/actions/workflows/CI-Tests.yml)

# Nationskollen API
This repository contains the API, database and other core infrastructure needed
for the "backend" of all clients, e.g. the [mobile app](https://github.com/dsp-krabby/mobile)
and [website](https://github.com/dsp-krabby/web).

## Documentation
All documentation for Nationskollen is available [here](https://github.com/dsp-krabby/docs).

## Development
1. `npm install`
2. `npm run setup`
3. `npm run dev`

The API will now be available at `localhost:3333`.

### Database
During development, SQLite3 is used as database. This means that no additional
setup is needed. All dependencies and setup will be made automatically after
running `npm install`. `npm run setup` will run database migrations and seed the
database with test data (only in development mode).

### Commands
* `npm run setup` - Run database migrations and seeders
* `npm run build` - Build the application for production
* `npm run start` - Start the server in production mode
* `npm run dev` - Start the server in development mode
* `npm run lint` - Run ESLint on all source files
* `npm run format` - Format all source files using Prettier
* `npm run test` - Run all tests defined in `test/`
* `npm run coverage` - Get test coverage as HTML in `coverage/index.html`

### Insomnia
Insomnia can be setup by importing the workspace file in
`.insomnia/Workspace/nationskollen.json`. Tokens are auto-generated and will be
inserted automatically when making authenticated requests.
