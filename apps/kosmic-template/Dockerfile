# Use the official Node.js image as the base image
FROM node:22-bookworm-slim

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./
COPY package-lock.json ./package-lock.json

# Install dependencies
RUN npm ci

# Copy the application files
COPY . .

# Expose the port
EXPOSE 3000

# Start the application
CMD [ "node", "dist/src/index.js"]
