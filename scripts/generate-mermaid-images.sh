#!/bin/bash

# Script pour générer des images PNG/SVG à partir des diagrammes Mermaid
# Nécessite: npm install -g @mermaid-js/mermaid-cli

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DOC_DIR="$PROJECT_ROOT/documentation"
IMAGES_DIR="$DOC_DIR/images"

echo "🎨 Génération des images Mermaid..."

# Créer le dossier images s'il n'existe pas
mkdir -p "$IMAGES_DIR"

# Vérifier si mmdc est installé
if ! command -v mmdc &> /dev/null; then
    echo "❌ Mermaid CLI n'est pas installé."
    echo "📦 Installation avec: npm install -g @mermaid-js/mermaid-cli"
    exit 1
fi

# Extraire les diagrammes du fichier ANALYSE.md
echo "📄 Extraction des diagrammes de ANALYSE.md..."

# Compteur pour nommer les fichiers
counter=1

# Extraire chaque bloc mermaid
awk '/```mermaid/,/```/' "$DOC_DIR/ANALYSE.md" | \
while IFS= read -r line; do
    if [[ $line == "```mermaid" ]]; then
        # Nouveau diagramme
        diagram_file="$IMAGES_DIR/diagram-$counter.mmd"
        echo "" > "$diagram_file"
        in_diagram=true
    elif [[ $line == "```" ]] && [[ $in_diagram == true ]]; then
        # Fin du diagramme, générer l'image
        echo "🖼️  Génération du diagramme $counter..."
        mmdc -i "$diagram_file" -o "$IMAGES_DIR/diagram-$counter.png" -b transparent
        mmdc -i "$diagram_file" -o "$IMAGES_DIR/diagram-$counter.svg"
        rm "$diagram_file"
        ((counter++))
        in_diagram=false
    elif [[ $in_diagram == true ]]; then
        # Ligne du diagramme
        echo "$line" >> "$diagram_file"
    fi
done

echo "✅ Images générées dans $IMAGES_DIR"
echo "📊 Total: $((counter-1)) diagrammes"
