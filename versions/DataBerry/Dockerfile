# Stage 1: Builder
FROM node:20-slim as builder

WORKDIR /app

# Copy package.json and package-lock.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Run the full build process (client and server)
RUN npm run build

# Stage 2: Production
FROM node:20-slim

WORKDIR /app

# Copy over the production-ready files from the builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Expose the port
EXPOSE 8080

# Start the application
CMD ["npm", "run", "start"]
