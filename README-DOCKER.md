# Docker Setup for Glossaria

## Overview
This project includes Docker support to solve Node.js version compatibility issues. The Docker setup uses Node.js 18.20.8, which is compatible with all project dependencies including Astro.

## Prerequisites
- Docker installed and running
- Make utility (usually pre-installed on Linux/macOS)

## Quick Start

### 1. Build the Docker Image
```bash
make docker-build
```

### 2. Validate Data
```bash
make docker-validate
```

### 3. Generate JSON Files
```bash
make docker-generate
```

### 4. Start Development Server
```bash
make docker-dev
```
The development server will be available at http://localhost:4321

### 5. Build for Production
```bash
make docker-build-prod
```

## Available Docker Commands

| Command | Description |
|---------|-------------|
| `make docker-build` | 🐳 Builds the Docker image |
| `make docker-dev` | 🐳 Starts development server in Docker |
| `make docker-build-prod` | 🐳 Builds the project for production in Docker |
| `make docker-validate` | 🐳 Validates CSV data using Docker |
| `make docker-generate` | 🐳 Generates JSON files using Docker |
| `make docker-translate` | 🐳 Runs translation scripts using Docker |
| `make docker-status` | 🐳 Shows Docker containers and images status |
| `make docker-clean` | 🐳 Cleans up Docker containers and images |

## Docker Files

### Dockerfile
- Based on `node:18.20.8-alpine`
- Includes make utility
- Pre-installs all dependencies
- Exposes port 4321 for development

### docker-compose.yml
- Provides alternative Docker Compose setup
- Note: Direct docker commands are recommended due to compatibility issues with older docker-compose versions

## Advantages of Docker Setup

1. **Version Consistency**: Uses Node.js 18.20.8 regardless of host system version
2. **Isolated Environment**: Dependencies are contained within the Docker image
3. **Easy Setup**: Single command to build and run
4. **Cross-Platform**: Works on any system with Docker support

## Troubleshooting

### Docker Compose Issues
If you encounter issues with docker-compose, use the direct docker commands provided in the Makefile instead. The project is configured to work with both approaches.

### Port Conflicts
If port 4321 is already in use, you can modify the docker-dev command in the Makefile to use a different port:
```bash
docker run --rm -p 3000:4321 -v $(PWD):/app -w /app glossaria make dev
```

### Volume Mount Issues
The Docker commands use volume mounts to sync generated files with the host system. Ensure Docker has permission to access the project directory.

### Configuración Dual: Producción vs Desarrollo

El proyecto ahora soporta dos modos de operación:

#### 🏭 **Modo Producción** (Recomendado para servidores)
- **Archivo**: `docker-compose.yml`
- **Características**: Bind mounts directos, sin dependencias externas
- **Uso**: Comandos estándar (`make validate`, `make generate`, etc.)

#### 🔧 **Modo Desarrollo** (Para desarrollo local con mejor rendimiento)
- **Archivo**: `docker-compose.dev.yml`
- **Características**: Usa docker-sync para mejor rendimiento
- **Uso**: Comandos con sufijo `-dev` (`make validate-dev`, `make generate-dev`, etc.)

### Usando Docker Sync (Modo Desarrollo)

#### Instalación de Docker Sync
```bash
# Instalar docker-sync gem
gem install docker-sync
```

#### Uso con Docker Sync
1. **Usar comandos de desarrollo** (docker-sync se inicia automáticamente):
   ```bash
   # Desarrollo con docker-sync (auto-inicia docker-sync)
   make start-dev

   # Validación con docker-sync (auto-inicia docker-sync)
   make validate-dev

   # Generación con docker-sync (auto-inicia docker-sync)
   make generate-dev

   # Build de producción con docker-sync (auto-inicia docker-sync)
   make build-prod-dev
   ```

2. **Parar docker-sync** al terminar:
   ```bash
   docker-sync stop
   ```

#### Configuración Docker Sync
El proyecto incluye:
- `docker-sync.yml`: Configuración de sincronización usando estrategia unison
- `docker-compose.dev.yml`: Configuración de desarrollo con volúmenes docker-sync

**Nota**: Docker Sync es especialmente beneficioso para:
- Sistemas Ubuntu/Linux con problemas de rendimiento
- Proyectos con muchos archivos pequeños
- Flujos de desarrollo que requieren observación rápida de archivos

## Development Workflow

### 🏭 Flujo de Producción (Recomendado para servidores)
1. Build the image once: `make build`
2. Validate your data: `make validate`
3. Generate JSON files: `make generate`
4. Start development: `make start`
5. Build for production: `make build-prod`

### 🔧 Flujo de Desarrollo (Con docker-sync para mejor rendimiento)
1. Build the image once: `make build`
2. Validate your data: `make validate-dev` (auto-inicia docker-sync)
3. Generate JSON files: `make generate-dev` (auto-inicia docker-sync)
4. Start development: `make start-dev` (auto-inicia docker-sync)
5. Build for production: `make build-prod-dev` (auto-inicia docker-sync)
6. Stop docker-sync when done: `docker-sync stop`

### 🚀 Para Auto-Deploy (Producción)
El script `scripts/auto-deploy.sh` usa automáticamente el modo producción:
- `make validate` (sin docker-sync)
- `make generate` (sin docker-sync)
- `make build-prod` (sin docker-sync)

The Docker setup provides a complete development environment without requiring Node.js installation on the host system.
