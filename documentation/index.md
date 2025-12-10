# Documentation du Projet

Ce dossier contient toute la documentation du projet de validation bancaire Dougs.

## 📚 Structure de la Documentation

```
documentation/
├── index.md                     # Ce fichier (index de la documentation)
├── analyse.md                   # ⭐ Document principal d'analyse
├── installation_mermaid.md      # Guide pour visualiser les diagrammes
├── api/                         # Documentation API OpenAPI
│   ├── index.md
│   ├── openapi.json
│   ├── openapi.yaml
│   └── api-documentation.html
└── images/                      # Images générées des diagrammes Mermaid
```

## 📖 Documents Disponibles

### [analyse.md](./analyse.md) ⭐

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
- Analyse de complexité algorithmique

**📊 Visualisation** : Ce document contient des diagrammes Mermaid. Consultez [installation_mermaid.md](./installation_mermaid.md) pour savoir comment les visualiser.

### [installation_mermaid.md](./installation_mermaid.md)

Guide pour installer et visualiser les diagrammes Mermaid dans différents outils (Cursor, VS Code, GitHub, etc.).

### [api/index.md](./api/index.md)

Documentation de l'API OpenAPI avec instructions d'utilisation, génération de clients, etc.

---

## 🎯 Pour le Recruteur

**Document à lire** : [analyse.md](./analyse.md)

Ce document unique présente de manière synthétique et structurée :

- La compréhension du problème métier
- La démarche de réflexion étape par étape
- Les choix techniques et leur justification
- L'algorithme de validation avec diagrammes visuels
- Les résultats et la conformité aux exigences
- L'analyse de complexité algorithmique

**💡 Note** : Les diagrammes Mermaid sont automatiquement rendus sur GitHub. Si vous lisez le document localement, consultez [installation_mermaid.md](./installation_mermaid.md) pour installer les extensions nécessaires.

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

---

## 📡 Documentation API

Pour la documentation complète de l'API, consultez [api/index.md](./api/index.md).

**Accès rapide** :

- **Swagger UI** : `http://localhost:3000/api` (quand l'application est démarrée)
- **Documentation HTML** : Ouvrir `api/api-documentation.html` dans un navigateur
- **Fichiers OpenAPI** : `api/openapi.json` et `api/openapi.yaml`
