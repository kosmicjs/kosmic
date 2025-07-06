# Config

## .env

.env is applied to all environments

## .env.{process.env.NODE_ENV}

where process.env.NODE_ENV can only be `development`, `production`, or `test`. Values from `.env` will be overridden.

## env vars from the environment

overrides other methods of env passing
