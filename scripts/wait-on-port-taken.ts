/* eslint-disable no-console */
import net from 'node:net';
import {setTimeout} from 'node:timers/promises';

/**
 * Recursively checks if a port is in use by attempting to create a connection
 *
 * @param port The TCP port to check
 * @param delay Delay between attempts in milliseconds (default: 100)
 * @returns Promise that resolves to true if port is in use, false otherwise
 */
export async function waitForPortToBeTaken(
  port: number,
  delay = 250,
): Promise<void> {
  // Try to connect to the port
  try {
    await new Promise<void>((resolve) => {
      const socket = new net.Socket();

      // Set timeout to avoid hanging
      socket.setTimeout(5000);

      // Handle connection success (port is in use)
      socket.on('connect', () => {
        socket.destroy();
        resolve();
      });

      // Handle errors (port is not in use)
      socket.on('error', async () => {
        socket.destroy();

        // Try again after delay
        await setTimeout(delay);

        try {
          await waitForPortToBeTaken(port, delay);
          resolve();
        } catch (error) {
          console.error(`Error checking port ${port}:`, error);
          resolve();
        }
      });

      // Handle timeout (treat as port not in use)
      socket.on('timeout', async () => {
        socket.destroy();

        // Try again after delay
        await setTimeout(delay);

        try {
          await waitForPortToBeTaken(port, delay);
          console.log(`Port ${port} is now taken`);
          resolve();
        } catch (error: unknown) {
          console.error(`Error checking port ${port}:`, error);
          resolve();
        }
      });

      // Try to connect to localhost on the specified port
      socket.connect(port, 'localhost');
    });
  } catch (error) {
    console.error(`Unexpected error checking port ${port}:`, error);

    await setTimeout(delay);

    return waitForPortToBeTaken(port, delay);
  }
}

/**
 * A simpler version that just checks once if a port is in use
 *
 * @param port The TCP port to check
 * @returns Promise that resolves to true if port is in use, false otherwise
 */
export async function isPortInUse(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();

    socket.setTimeout(5000);

    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });

    socket.on('error', () => {
      socket.destroy();
      resolve(false);
    });

    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });

    socket.connect(port, 'localhost');
  });
}

/**
 * Recursively checks if a port is free by attempting to create a connection
 *
 * @param port The TCP port to check
 * @param delay Delay between attempts in milliseconds (default: 500)
 * @returns Promise that resolves to true if port is free, false if it stays in use
 */
export async function waitForPortToBeFree(
  port: number,
  delay = 250,
): Promise<void> {
  try {
    // Check if port is in use
    const portInUse = await isPortInUse(port);

    // If port is free, return success
    if (!portInUse) {
      console.log(`Port ${port} is now free`);
      return;
    }

    // Port is still in use, wait and try again
    console.log(`Port ${port} still in use, waiting...`);
    await setTimeout(delay);
    await waitForPortToBeFree(port, delay);
  } catch (error) {
    console.error(`Unexpected error checking if port ${port} is free:`, error);

    await setTimeout(delay);
    return waitForPortToBeFree(port, delay);
  }
}
