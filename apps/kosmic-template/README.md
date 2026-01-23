# The Kosmic JS Template

The Kosmic JS template aims to be a production ready starter kit for modern business to bootstrap an opinionated and robust but easy to modify template with awesome default behavior.

- Based on the koa http middleware framework which features an incredibly robust eco system. This makes the kosmic template extensible for any purpose.
  - Using completely custom type definitions which we maintain, we make working with Koa and TS easier than ever, with clearer type names and more straight forward behavior.
- JSX as a template engine powered by the preact library.
  - JSX provides deep type safety even at the view layer and has robust tooling due to the popularity of react.
  - preact has a _fast_ render to string implementation with an added bonus of supporting client side js. Quickly use your server side partials as preact islands to enable client side interactivity with state management.
- HTMX powers general client side interactivity with its simple html primitives
- PostgreSQL powers the DB and Kysely acts a simple query builder with robust type safety.
- A nextjs style file system based routing layer that makes working with and viewing your routes _easy_.
- Auth and user management built with passport js so you own your own data and do not need to outsource.
- client side build based on vite, complete with easy public folder asset serving, client side js organization, and easy css options that support any modern css tools such as postcss, scss, tailwind, etc...

## Philosophy

Kosmic is the personal framework of me, [spence-s](https://www.github.com/spence-s). With the original intent to create a Node.JS framework for front end developers to see the benefits of monolithic development and to utilize the best of modern, client side heavy, JS frameworks, without the client side bloat, and magic like complexity that often accompanies it.

> Kosmic is highly inspired by and borrows many practices from [lad.js](https://github.com/ladjs/lad).

