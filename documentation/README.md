# Documentation du Projet

Ce dossier contient la documentation du projet de validation bancaire Dougs.

## 📚 Fichiers disponibles

### [ANALYSE.md](./ANALYSE.md) ⭐

**Document principal** présentant l'approche méthodique du problème, étape par étape. Ce document est destiné au recruteur pour comprendre la démarche de réflexion et les choix techniques effectués.

**Contenu** :

- Compréhension du problème métier
- Analyse technique et décomposition
- Architecture et structure du code
- Algorithme de validation détaillé avec **11 diagrammes Mermaid**
- Décisions de design justifiées
- Tests et validation
- Itérations et améliorations
- Résultats et conformité aux exigences

**📊 Visualisation** : Ce document contient des diagrammes Mermaid. Consultez [INSTALLATION_MERMAID.md](./INSTALLATION_MERMAID.md) pour savoir comment les visualiser.

### [INSTALLATION_MERMAID.md](./INSTALLATION_MERMAID.md)

Guide pour installer et visualiser les diagrammes Mermaid dans différents outils (Cursor, VS Code, GitHub, etc.).

---

## 🎯 Pour le recruteur

**Document à lire** : [ANALYSE.md](./ANALYSE.md)

Ce document unique présente de manière synthétique et structurée :

- La compréhension du problème métier
- La démarche de réflexion étape par étape
- Les choix techniques et leur justification
- L'algorithme de validation avec diagrammes visuels
- Les résultats et la conformité aux exigences

**💡 Note** : Les diagrammes Mermaid sont automatiquement rendus sur GitHub. Si vous lisez le document localement, consultez [INSTALLATION_MERMAID.md](./INSTALLATION_MERMAID.md) pour installer les extensions nécessaires.

---

## 🖼️ Génération d'Images (Optionnel)

Si vous avez besoin d'une version avec des images PNG/SVG des diagrammes :

```bash
# Installer Mermaid CLI
npm install -g @mermaid-js/mermaid-cli

# Générer les images (via npm script)
npm run generate:diagrams

# OU directement
node scripts/generate-diagrams.js
```

Les images seront générées dans `documentation/images/`.
