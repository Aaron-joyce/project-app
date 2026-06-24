# Build Stage
FROM oven/bun:1.1 AS build
WORKDIR /app

# Copy package and lock files and install dependencies
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy remaining source code and build static production assets
COPY . .
RUN bun run build

# Web Server Stage (serve compiled assets with Nginx)
FROM nginx:alpine AS final
COPY --from=build /app/dist /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
