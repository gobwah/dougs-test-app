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

---

## 📡 Documentation API OpenAPI

### Fichiers disponibles

- **`openapi.json`** : Documentation OpenAPI au format JSON
- **`openapi.yaml`** : Documentation OpenAPI au format YAML
- **`api-documentation.html`** : Documentation statique HTML générée avec Redoc (peut être ouverte directement dans un navigateur)

### Génération automatique

La documentation API est **générée automatiquement** par un workflow GitHub Actions lors de chaque push sur la branche `main` si des fichiers de l'API ont été modifiés (controllers, DTOs, services, modules).

### Génération manuelle

Pour générer la documentation manuellement :

```bash
npm run generate:api-docs
```

### Utilisation

Ces fichiers peuvent être utilisés avec :

- **Documentation statique HTML** : Ouvrez directement `api-documentation.html` dans votre navigateur pour une documentation interactive et élégante
- **Swagger UI** : Importez le fichier JSON ou YAML dans [Swagger Editor](https://editor.swagger.io/)
- **Postman** : Importez le fichier pour générer une collection automatiquement
- **Outils de génération de clients** : Utilisez des outils comme `openapi-generator` pour générer des clients dans différents langages (TypeScript, Python, Java, etc.)

### Exemple d'utilisation avec openapi-generator

```bash
# Installer openapi-generator
npm install -g @openapitools/openapi-generator-cli

# Générer un client TypeScript
openapi-generator-cli generate \
  -i documentation/openapi.yaml \
  -g typescript-axios \
  -o generated-client
```
