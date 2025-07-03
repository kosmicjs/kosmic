# Islands

Every thing in this islands folder needs to be compatible with both browser and node js env. They should not access secrets.

Be careful to not import anything into islands that you don't want exposed on both the server and client side.

Ensure that all client side code is wrapped in functions and will not execute on the server side.

preact/react style callbacks are fine as well as useEffect and other hooks that are isolated in functions that will only be called client side.
