# GlossarIA

GlossarIA is an open, bilingual (ES/EN), community-driven glossary of Artificial 
Intelligence concepts, focused on practical and business-oriented definitions.

The goal is simple:
Provide a clean, accessible, and continuously updated reference for professionals, 
teams, educators, and companies adopting AI technologies.

## Key Features

- Single Source of Truth: a CSV file (`/data/glossary.csv`)
- Bilingual ES/EN entries
- Open contribution via Pull Requests
- Automated DeepL translations for EN
- Static website (Astro) with search
- PDF export of the current version
- Per-term versioning and timestamps
- MIT license for code, CC BY 4.0 for content

## Getting Started

### Prerequisites
- Node.js 18.20.8+ (for local development)
- OR Docker (recommended for version compatibility)

### Environment Configuration

Before running the project, you need to create a `.env` file from the provided template:

```bash
# Copy the sample environment file
cp .env.sample .env
```

The `.env` file contains the following configuration:

- **ENVIRONMENT**: Defines the execution environment
  - `development`: Uses docker-sync for improved performance on macOS/Windows
  - `production`: Uses direct bind mounts (faster on Linux)

**Note**: The `.env` file is ignored by Git (listed in `.gitignore`) to prevent committing local configurations. Always use `.env.sample` as the reference template.

### Quick Start

#### Option 1: Local Development
```bash
# Install dependencies
make install

# Validate data
make validate

# Generate JSON files
make generate

# Start development server
make dev
```

#### Option 2: Docker (Recommended)
```bash
# Build Docker image
make docker-build

# Validate data using Docker
make docker-validate

# Generate JSON files using Docker
make docker-generate

# Start development server using Docker
make docker-dev
```

For detailed Docker instructions, see [README-DOCKER.md](README-DOCKER.md).


## Repository Structure

```
glossaria/
├─ data/
│  └─ glossary.csv
├─ scripts/
│  ├─ translate-deepl.js
│  ├─ validate-csv.js
│  └─ generate-json.js
├─ web/
├─ .github/
│  └─ workflows/
│     ├─ auto-translate.yml
│     ├─ validate-csv.yml
│     └─ generate-json.yml
├─ docs/
│  ├─ CONTRIBUTING.md
│  ├─ CODE_OF_CONDUCT.md
│  └─ VERSIONING.md
├─ LICENSE
├─ CONTENT_LICENSE
└─ README.md
```

## Glossary Data Model

Columns inside `glossary.csv`:

```
id,
section,
tags,
level,
status,
version,
created_at,
updated_at,
term_es,
short_es,
long_es,
example_es,
term_en,
short_en,
long_en,
example_en
```

### Available Sections

The glossary is organized into the following sections:

- **fundamentos**: Basic concepts and foundations of AI
- **modelos_arquitecturas**: AI models and architectures
- **tecnicas_procesos**: Techniques and processes in AI
- **aplicaciones_herramientas**: AI applications and tools
- **etica_regulacion**: Ethics and regulation in AI

### Status Values

- **activo**: Active terms with complete definitions
- **revisar**: Terms that need review or updates
- **obsoleto**: Obsolete or deprecated terms

### Level Values

- **basico**: Basic level concepts
- **intermedio**: Intermediate level concepts
- **avanzado**: Advanced level concepts

## Deployment

### Production Deployment (Recommended)

The project includes an automated deployment script that handles the entire process (pulling changes, validating data, generating JSON files, and building the site).

```bash
# Run the auto-deploy script
./scripts/auto-deploy.sh
```

### Manual Deployment

If you prefer to run the steps manually:

1.  **Validate Data**: Ensure the CSV has no errors.
    ```bash
    make validate
    ```
2.  **Generate JSON**: Update the web data from the CSV.
    ```bash
    make generate
    ```
3.  **Build**: Create the production-ready web application.
    ```bash
    make build
    ```

## Contributing

You can propose:

- new terms
- improvements to definitions
- translation corrections
- website or script enhancements

See [CONTRIBUTING.md](https://github.com/emartos/GlossarIA/blob/main/docs/CONTRIBUTING.md) for full guidelines.

## Website (Astro)

The website provides:

- full-text search
- filters by section/tags/level
- ES/EN switcher
- term detail pages
- feedback → pull request automation
- current-version PDF export

## Licensing

- Code → MIT License
- Glossary content → CC BY 4.0

Attribution example:

Source: GlossarIA — https://github.com/emartos/GlossarIA
Licensed under CC BY 4.0.

## Roadmap

### ✅ Completed
- GitHub Actions auto-translation
- Initial Astro site
- Contribution form → PR generator
- CSV validation automation
- JSON generation automation

### 🚧 In Progress
- Enhanced validation rules
- Improved documentation
- Better error handling

### 📋 Planned
- PDF generation
- RSS feed for new terms
- Version dashboard
- Automated testing suite
- Performance optimizations
- Accessibility improvements

## Acknowledgements

GlossarIA is maintained by the community.  
All contributions are welcome!
