# Project Documentation

This folder contains all documentation for the Dougs bank validation project.

## 📚 Documentation Structure

```
documentation/
├── fr/                          # Documentation en français
│   ├── index.md
│   ├── analysis.md
│   ├── deployment.md
│   ├── install_mermaid.md
│   └── api_index.md
├── en/                          # Documentation in English
│   ├── index.md
│   ├── analysis.md
│   ├── deployment.md
│   ├── install_mermaid.md
│   └── api_index.md
├── api/                         # OpenAPI API documentation
│   ├── openapi.json
│   ├── openapi.yaml
│   └── api-documentation.html
└── images/                      # Generated Mermaid diagram images
```

## 📖 Available Documents

### [analysis.md](./analysis.md) ⭐

**Main document** presenting the methodical approach to the problem, step by step. Contains detailed validation algorithm with **11 Mermaid diagrams**, technical choices, and algorithmic complexity analysis.

**📊 Visualization**: This document contains Mermaid diagrams. See [install_mermaid.md](./install_mermaid.md) to learn how to visualize them.

### [install_mermaid.md](./install_mermaid.md)

Guide for installing and visualizing Mermaid diagrams in different tools (Cursor, VS Code, GitHub, etc.).

### [api_index.md](./api_index.md)

OpenAPI API documentation with usage instructions, client generation, etc.

### [deployment.md](./deployment.md)

Complete deployment guide with Docker and manual deployment.

---

## 🎯 For the Recruiter

**Document to read**: [analysis.md](./analysis.md)

This unique document presents in a synthetic and structured way:

- Business problem understanding
- Step-by-step thought process
- Technical choices and their justification
- Validation algorithm with visual diagrams
- Results and compliance with requirements
- Algorithmic complexity analysis

**💡 Note**: Mermaid diagrams are automatically rendered on GitHub. If you read the document locally, see [install_mermaid.md](./install_mermaid.md) to install the necessary extensions.

---

## 🖼️ Image Generation (Optional)

If you need a version with PNG/SVG images of the diagrams:

```bash
# Install Mermaid CLI
npm install -g @mermaid-js/mermaid-cli

# Generate images (via npm script)
npm run generate:diagrams

# OR directly
node scripts/generate-diagrams.js
```

Images will be generated in `documentation/images/`.

---

## 📡 API Documentation

For complete API documentation, see [api_index.md](./api_index.md).

**Quick access**:

- **Swagger UI**: `http://localhost:3000/api` (when the application is running)
- **HTML Documentation**: Open `../api/api-documentation.html` in a browser
- **OpenAPI Files**: `../api/openapi.json` and `../api/openapi.yaml`
