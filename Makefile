# Glossaria - Makefile
# Docker commands for the AI glossary project

.PHONY: help build start validate generate translate status stop info env shell restart destroy logs logs-follow

# Load environment variables from .env file
ifneq (,$(wildcard ./.env))
    include .env
    export
endif

# Variables
DATA_DIR = data
SCRIPTS_DIR = scripts
WEB_DIR = web
CSV_FILE = $(DATA_DIR)/glossary.csv
JSON_FILE = $(DATA_DIR)/glossary.json

# Environment-based configuration
ENVIRONMENT ?= development
ifeq ($(ENVIRONMENT),development)
    COMPOSE_FILE = docker-compose.dev.yml
    DOCKER_SYNC_REQUIRED = true
else
    COMPOSE_FILE = docker-compose.yml
    DOCKER_SYNC_REQUIRED = false
endif

# Default command
help: ## 📚 Shows this help with all available commands
	@echo "🚀 Glossaria - Artificial Intelligence Glossary"
	@echo "🐳 Execution controlled by Docker container"
	@echo ""
	@echo "🌍 Current environment: $(ENVIRONMENT)"
	@echo "📁 Using compose file: $(COMPOSE_FILE)"
	@echo ""
	@echo "📋 Available commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' Makefile | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'
	@echo ""
	@echo "💡 Usage examples:"
	@echo ""
	@echo "📝 Environment configuration:"
	@echo "  Edit .env file to set ENVIRONMENT=development or ENVIRONMENT=production"
	@echo ""
	@echo "🚀 Main commands (automatically adapt to environment):"
	@echo "  make build       # Builds the Docker image and project"
	@echo "  make start       # Starts the server"
	@echo "  make validate    # Validates CSV data"
	@echo "  make generate    # Generates JSON files"
	@echo ""
	@echo "🔧 Development mode (ENVIRONMENT=development):"
	@echo "  - Uses docker-sync for better file system performance"
	@echo "  - Automatically starts docker-sync when needed"
	@echo "  - Use 'docker-sync stop' to stop docker-sync when done"
	@echo ""
	@echo "🏭 Production mode (ENVIRONMENT=production):"
	@echo "  - Uses direct bind mounts"
	@echo "  - Better for production deployments"
	@echo ""
	@echo "🛠️ Management:"
	@echo "  make restart     # Restarts the server"
	@echo "  make shell       # Access container shell"
	@echo "  make logs        # Shows container logs"
	@echo "  make destroy     # Removes only project containers"

# === MAIN COMMANDS ===
build: ## 🏗️ Builds the Docker image and project (adapts to environment)
	@echo "🏗️ Building Glossaria..."
	@echo "🌍 Environment: $(ENVIRONMENT)"
	@echo "🐳 Building Docker image..."
	docker build -t glossaria .
	@echo "✅ Docker image built"
ifeq ($(DOCKER_SYNC_REQUIRED),true)
	@echo "🔄 Starting docker-sync..."
	@if ! docker-sync list 2>/dev/null | grep -q "app-sync.*running"; then \
		echo "📦 Docker-sync not running, starting it..."; \
		docker-sync start; \
	else \
		echo "✅ Docker-sync already running"; \
	fi
endif
	@echo "🏗️ Building project..."
	docker compose -f $(COMPOSE_FILE) --profile build run --rm glossaria-build
	@echo "✅ Project built successfully"

build-container: ## 🏗️ Builds the project inside container (used by docker-compose)
	@echo "🏗️ Building project inside container..."
	@echo "📦 Installing dependencies..."
	cd web && npm install
	cd scripts && npm install
	@echo "⚙️ Validating CSV and generating JSON..."
	cd scripts && node validate-csv.js && node generate-json.js
	@echo "🔨 Building web application..."
	cd web && npm run build
	@echo "✅ Project built successfully inside container"

start: ## 🚀 Starts the server (adapts to environment)
	@echo "🚀 Starting development server..."
	@echo "🌍 Environment: $(ENVIRONMENT)"
	@echo "🌐 Server available at http://localhost:4321"
ifeq ($(DOCKER_SYNC_REQUIRED),true)
	@echo "ℹ️  Using docker-sync for hot reloading (development mode)"
	@echo "🔄 Starting docker-sync..."
	@if ! docker-sync list 2>/dev/null | grep -q "app-sync.*running"; then \
		echo "📦 Docker-sync not running, starting it..."; \
		docker-sync start; \
	else \
		echo "✅ Docker-sync already running"; \
	fi
else
	@echo "ℹ️  Using direct bind mounts (production mode)"
endif
	@echo "🚀 Starting containers..."
	docker compose -f $(COMPOSE_FILE) up -d glossaria


# === DATA COMMANDS ===
validate: ## ✅ Validates CSV (adapts to environment)
	@echo "🔍 Validating CSV in Docker..."
	@echo "🌍 Environment: $(ENVIRONMENT)"
ifeq ($(DOCKER_SYNC_REQUIRED),true)
	@echo "🔄 Starting docker-sync..."
	@if ! docker-sync list 2>/dev/null | grep -q "app-sync.*running"; then \
		echo "📦 Docker-sync not running, starting it..."; \
		docker-sync start; \
	else \
		echo "✅ Docker-sync already running"; \
	fi
endif
	@echo "🔍 Validating CSV..."
	docker compose -f $(COMPOSE_FILE) run --rm glossaria sh -c "cd scripts && node validate-csv.js"

generate: ## 🔄 Generates JSON (adapts to environment)
	@echo "⚙️ Generating JSON in Docker..."
	@echo "🌍 Environment: $(ENVIRONMENT)"
ifeq ($(DOCKER_SYNC_REQUIRED),true)
	@echo "🔄 Starting docker-sync..."
	@if ! docker-sync list 2>/dev/null | grep -q "app-sync.*running"; then \
		echo "📦 Docker-sync not running, starting it..."; \
		docker-sync start; \
	else \
		echo "✅ Docker-sync already running"; \
	fi
endif
	@echo "⚙️ Generating JSON..."
	docker compose -f docker-compose.yml exec glossaria \
	  sh -c "cd scripts && node validate-csv.js && node generate-json.js"

translate: ## 🌍 Executes translation (adapts to environment)
	@echo "🌍 Executing translation in Docker..."
	@echo "🌍 Environment: $(ENVIRONMENT)"
ifeq ($(DOCKER_SYNC_REQUIRED),true)
	@echo "🔄 Starting docker-sync..."
	@if ! docker-sync list 2>/dev/null | grep -q "app-sync.*running"; then \
		echo "📦 Docker-sync not running, starting it..."; \
		docker-sync start; \
	else \
		echo "✅ Docker-sync already running"; \
	fi
endif
	@echo "🌍 Executing translation..."
	docker compose -f $(COMPOSE_FILE) run --rm glossaria sh -c "cd scripts && node translate-deepl.js"

# === MANAGEMENT COMMANDS ===
shell: ## 🐚 Access container shell (interactive)
	@echo "🐚 Accessing container shell..."
	@echo "🌍 Environment: $(ENVIRONMENT)"
	@if docker compose -f $(COMPOSE_FILE) ps glossaria | grep -q "Up"; then \
		echo "📦 Connecting to running container..."; \
		docker compose -f $(COMPOSE_FILE) exec glossaria /bin/sh; \
	else \
		echo "📦 No running container found. Starting new interactive container..."; \
		docker compose -f $(COMPOSE_FILE) run --rm glossaria /bin/sh; \
	fi

restart: ## 🔄 Restarts the server (stops and starts again)
	@echo "🔄 Restarting Glossaria server..."
	@$(MAKE) stop
	@echo "⏳ Waiting 2 seconds before starting..."
	@sleep 2
	@$(MAKE) start
	@echo "✅ Glossaria server restarted"

status: ## 📊 Shows Docker containers status
	@echo "📊 Docker containers status:"
	@echo "🔍 Containers based on 'glossaria' image:"
	@CONTAINERS=$$(docker ps -a --filter "ancestor=glossaria" --format "table {{.ID}}\t{{.Names}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null); \
	if [ -n "$$CONTAINERS" ] && [ "$$CONTAINERS" != "CONTAINER ID	NAMES	STATUS	PORTS" ]; then \
		echo "$$CONTAINERS"; \
	else \
		echo "  ❌ No Glossaria containers found"; \
	fi
	@echo ""
	@echo "🔍 Containers with 'glossaria' in name:"
	@NAMED_CONTAINERS=$$(docker ps -a --filter "name=glossaria" --format "table {{.ID}}\t{{.Names}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null); \
	if [ -n "$$NAMED_CONTAINERS" ] && [ "$$NAMED_CONTAINERS" != "CONTAINER ID	NAMES	STATUS	PORTS" ]; then \
		echo "$$NAMED_CONTAINERS"; \
	else \
		echo "  ❌ No named Glossaria containers found"; \
	fi
	@echo ""
	@echo "🐳 Docker images:"
	@docker images | grep glossaria || echo "  ❌ No Glossaria images found"

stop: ## 🛑 Stops all Glossaria containers
	@echo "🛑 Stopping Glossaria containers..."
	@echo "🌍 Environment: $(ENVIRONMENT)"
	docker compose -f $(COMPOSE_FILE) down
	@echo "✅ All Glossaria containers stopped"

info: ## ℹ️ Shows project information
	@echo "ℹ️ Project information:"
	@echo ""
	@echo "📚 Glossaria - Artificial Intelligence Glossary"
	@echo "🐳 Tools: Docker, Node.js 18.20.8, Astro, CSV processing"
	@echo "📁 Structure:"
	@echo "  - data/: CSV and JSON glossary files"
	@echo "  - scripts/: Data processing scripts"
	@echo "  - web/: Web application with Astro"
	@echo ""
	@echo "🌐 Main commands:"
	@echo "  - make build: Build Docker image"
	@echo "  - make start: Development"
	@echo "  - make validate: Validate data"
	@echo "  - make generate: Generate JSON"

env: ## 🌍 Shows current environment configuration
	@echo "🌍 Current Environment Configuration:"
	@echo ""
	@echo "📋 Environment: $(ENVIRONMENT)"
	@echo "📁 Compose file: $(COMPOSE_FILE)"
	@echo "🔄 Docker-sync required: $(DOCKER_SYNC_REQUIRED)"
	@echo ""
ifeq ($(ENVIRONMENT),development)
	@echo "🔧 Development Mode Features:"
	@echo "  - Uses docker-sync for better file system performance"
	@echo "  - Hot reloading enabled"
	@echo "  - Development optimizations active"
else
	@echo "🏭 Production Mode Features:"
	@echo "  - Direct bind mounts for better performance"
	@echo "  - Production optimizations active"
	@echo "  - No docker-sync dependency"
endif
	@echo ""
	@echo "💡 To change environment:"
	@echo "  Edit .env file and set ENVIRONMENT=development or ENVIRONMENT=production"

destroy: ## 🗑️ Removes Glossaria project containers and images
	@echo "🗑️ Removing Glossaria project containers and images..."
	@echo "🛑 Stopping all Glossaria containers..."
	@docker ps -q --filter "ancestor=glossaria" | xargs -r docker stop || true
	@docker ps -q --filter "name=glossaria" | xargs -r docker stop || true
	@docker compose down --remove-orphans 2>/dev/null || true
	@echo "🗑️ Removing Glossaria containers..."
	@docker ps -aq --filter "ancestor=glossaria" | xargs -r docker rm -f || true
	@docker ps -aq --filter "name=glossaria" | xargs -r docker rm -f || true
	@echo "🖼️ Removing Glossaria images..."
	@docker images --filter "reference=glossaria*" -q | xargs -r docker rmi -f || true
	@docker images --filter "reference=*glossaria*" -q | xargs -r docker rmi -f || true
	@docker compose down --rmi all 2>/dev/null || true
	@echo "🧹 Cleaning up unused images and build cache..."
	@docker image prune -f || true
	@echo "✅ Glossaria containers and images removed!"

logs: ## 📋 Shows logs from running Glossaria containers
	@echo "📋 Showing Glossaria container logs..."
	@echo "🌍 Environment: $(ENVIRONMENT)"
	docker compose -f $(COMPOSE_FILE) logs --tail=50 glossaria
	@echo ""
	@echo "💡 Tip: Use 'make logs-follow' to follow logs in real-time"

logs-follow: ## 📋 Follows logs from running Glossaria containers in real-time
	@echo "📋 Following Glossaria container logs (Ctrl+C to stop)..."
	@echo "🌍 Environment: $(ENVIRONMENT)"
	@echo "🔄 Press Ctrl+C to stop following..."
	docker compose -f $(COMPOSE_FILE) logs -f glossaria
