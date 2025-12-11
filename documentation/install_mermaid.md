# Installation et Visualisation des Diagrammes Mermaid

## 🔌 Pour Cursor / VS Code

### Installation Automatique

Cursor/VS Code devrait vous proposer automatiquement d'installer les extensions recommandées lorsque vous ouvrez le projet.

### Installation Manuelle

1. Ouvrez la palette de commandes (`Cmd+Shift+P` sur Mac, `Ctrl+Shift+P` sur Windows/Linux)
2. Tapez "Extensions: Install Extensions"
3. Recherchez et installez une de ces extensions :
   - **Markdown Preview Mermaid Support** (bierner.markdown-mermaid)
   - **Mermaid Markdown Syntax Highlighting** (bpruitt-goddard.mermaid-markdown-syntax-highlighting)

### Vérification

Une fois installé, ouvrez `documentation/analyse.md` et utilisez la prévisualisation Markdown (`Cmd+Shift+V` ou `Ctrl+Shift+V`). Les diagrammes Mermaid devraient s'afficher correctement.

## 🌐 Pour GitHub / GitLab

Les diagrammes Mermaid sont **automatiquement rendus** sur GitHub et GitLab. Aucune action nécessaire !

## 🖼️ Génération d'Images (Optionnel)

Si vous avez besoin de générer des images PNG/SVG des diagrammes :

### Option 1 : Mermaid CLI

```bash
# Installer Mermaid CLI
npm install -g @mermaid-js/mermaid-cli

# Générer les images (depuis la racine du projet)
mmdc -i documentation/analyse.md -o documentation/images/
```

### Option 2 : Mermaid Live Editor

1. Allez sur https://mermaid.live/
2. Copiez-collez chaque diagramme (code entre `mermaid et `)
3. Exportez en PNG ou SVG
4. Sauvegardez dans `documentation/images/`

### Option 3 : Script Automatique (Node.js)

Un script Node.js `scripts/generate-diagrams.js` est disponible pour automatiser la génération :

```bash
# Avec npm script (recommandé)
npm run generate:diagrams

# Ou directement
node scripts/generate-diagrams.js
```

**Alternative** : Un script shell `scripts/generate-mermaid-images.sh` est également disponible.

## 📱 Autres Outils

- **Obsidian** : Support natif
- **Notion** : Support natif
- **Typora** : Nécessite un plugin
- **En ligne** : https://mermaid.live/
