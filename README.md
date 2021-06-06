[![Environment Tests](https://github.com/dsp-krabby/server/actions/workflows/CI-Tests.yml/badge.svg?branch=main)](https://github.com/dsp-krabby/server/actions/workflows/CI-Tests.yml)

# Nationskollen API
This repository contains the API, database and other core infrastructure needed
for the "backend" of all clients, e.g. the [mobile app](https://github.com/dsp-krabby/mobile)
and [website](https://github.com/dsp-krabby/web).

## Documentation
All documentation for Nationskollen is available [here](https://github.com/dsp-krabby/docs).

## Development
1. `npm install`
2. Setup the database as described below (for your chosen database)
3. `npm run dev`

The API will now be available at `localhost:3333`.

### Database
During development you can use either SQLite3 or PostgreSQL. Note that SQLite3
does not support datetime filtering and event filtering does not work. Because
of this, the default database is PostgreSQL.

#### SQLite3 setup
Set `DB_CONNECTION` to `sqlite` in `.env`. Now everything should work as
expected.

#### PostgreSQL setup
Before starting the database, make sure the following is installed:
- docker
- docker-compose

then use `npm run pg:up` to setup the container (use `npm run pg:sudo-up` if you need sudo permissions)
then `npm run pg:start` to start the container.

##### For mac (what is known at least):
* Have the Docker Desktop application running while executing commands in the terminal.

Install the dependencies and make sure that the docker service is running (e.g.
by enabling the docker daemon in systemd services or by starting Docker Desktop)
and start the PostgreSQL container using `npm run pg:start`.
If you want to stop the container you can run `npm run pg:stop`.

> Note that you will most likely need to prefix the `pg:start` and `pg:stop`
commands with `sudo` to be able to start the container.

#### Creating the required tables
Before you can start the server using `npm run dev` you must run migrations and
seeders using `npm run setup`. Note that this is **not required** to run tests,
since it will automatically do this.

### Commands
* `npm run pg:start` - Starts the PostgreSQL database in docker
* `npm run pg:sudo-start` - Starts (as sudo user) the PostgreSQL database in docker
* `npm run pg:stop` - Stops the PostgreSQL database docker container
* `npm run pg:sudo-stop` - Stops (as sudo user) the PostgreSQL database docker container
* `npm run pg:up` - Setup the PostgreSQL database docker container
* `npm run pg:sudo-up` - Setup (as sudo user) the PostgreSQL database docker container
* `npm run setup` - Run database migrations and seeders
* `npm run build` - Build the application for production
* `npm run start` - Start the server in production mode
* `npm run dev` - Start the server in development mode
* `npm run lint` - Run ESLint on all source files
* `npm run format` - Format all source files using Prettier
* `npm run test` - Run all tests defined in `test/`
* `npm run coverage` - Get test coverage as HTML in `coverage/index.html`
* `npm run docs` - Generate documentation
* `npm run docs` - Generate documentation and watch for changes

### Insomnia
Insomnia can be setup by importing the workspace file in
`.insomnia/Workspace/nationskollen.json`. Tokens are auto-generated and will be
inserted automatically when making authenticated requests.
