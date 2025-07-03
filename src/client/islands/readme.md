# Islands

Every thing in this islands folder needs to be compatible with both browser and node js env. They should not access secrets.

Be careful to not import anything into islands that you don't want exposed on both the server and client side.

Ensure that all client side code is wrapped in functions and will not execute on the server side.

preact/react style callbacks are fine as well as useEffect and other hooks that are isolated in functions that will only be called client side.

## Naming Convention

Island files work based on a specific naming convention.

- Island files should export 2 components
  - The primary component should have the same camelCased name as file name
    - ie... `counter.ts` exports a named `Counter` component
  - The secondary component is the island wrapper, which can take a data-props attribute
    - This function should be named the same as the primary component with an `Island` suffix
      - ie... `Counter` is the primary component, then `CounterIsland` is the secondary "server" component
