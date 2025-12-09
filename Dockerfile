FROM node:18.20.8-alpine

# Set working directory
WORKDIR /app

# Install make (required for our Makefile)
RUN apk add --no-cache make

# Copy package files first for better caching
COPY web/package*.json ./web/
COPY scripts/package*.json ./scripts/

# Copy the rest of the project
COPY . .

# Install dependencies
RUN cd web && npm install && cd ../scripts && npm install

# Build the web application for production
RUN cd web && npm run build

# Expose port for development server
EXPOSE 4321

# Default command
CMD ["make", "dev"]
