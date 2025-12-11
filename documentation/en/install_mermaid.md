# Mermaid Diagram Installation and Visualization

## 🔌 For Cursor / VS Code

### Automatic Installation

Cursor/VS Code should automatically suggest installing recommended extensions when you open the project.

### Manual Installation

1. Open the command palette (`Cmd+Shift+P` on Mac, `Ctrl+Shift+P` on Windows/Linux)
2. Type "Extensions: Install Extensions"
3. Search for and install one of these extensions:
   - **Markdown Preview Mermaid Support** (bierner.markdown-mermaid)
   - **Mermaid Markdown Syntax Highlighting** (bpruitt-goddard.mermaid-markdown-syntax-highlighting)

### Verification

Once installed, open `documentation/en/analysis.md` and use Markdown preview (`Cmd+Shift+V` or `Ctrl+Shift+V`). Mermaid diagrams should display correctly.

## 🌐 For GitHub / GitLab

Mermaid diagrams are **automatically rendered** on GitHub and GitLab. No action needed!

## 🖼️ Image Generation (Optional)

If you need to generate PNG/SVG images of the diagrams:

### Option 1: Mermaid CLI

```bash
# Install Mermaid CLI
npm install -g @mermaid-js/mermaid-cli

# Generate images (from project root)
mmdc -i documentation/en/analysis.md -o documentation/images/
```

### Option 2: Mermaid Live Editor

1. Go to https://mermaid.live/
2. Copy-paste each diagram (code between `mermaid` and `)
3. Export as PNG or SVG
4. Save in `documentation/images/`

### Option 3: Automatic Script (Node.js)

A Node.js script `scripts/generate-diagrams.js` is available to automate generation:

```bash
# With npm script (recommended)
npm run generate:diagrams

# Or directly
node scripts/generate-diagrams.js
```

**Alternative**: A shell script `scripts/generate-mermaid-images.sh` is also available.

## 📱 Other Tools

- **Obsidian**: Native support
- **Notion**: Native support
- **Typora**: Requires a plugin
- **Online**: https://mermaid.live/
