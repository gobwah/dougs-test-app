#!/usr/bin/env node

/**
 * Script pour générer des images PNG/SVG à partir des diagrammes Mermaid
 *
 * Usage:
 *   node scripts/generate-diagrams.js
 *
 * Prérequis:
 *   npm install -g @mermaid-js/mermaid-cli
 *   OU
 *   npm install --save-dev @mermaid-js/mermaid-cli
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const DOC_DIR = path.join(PROJECT_ROOT, 'documentation');
const MARKDOWN_FILE = path.join(DOC_DIR, 'fr', 'analysis.md');
const IMAGES_DIR = path.join(DOC_DIR, 'images');

// Vérifier si mmdc est disponible
function checkMermaidCLI() {
  try {
    execSync('mmdc --version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

// Extraire les diagrammes du fichier Markdown
function extractDiagrams(markdownContent) {
  const diagrams = [];
  const mermaidRegex = /```mermaid\n([\s\S]*?)```/g;
  let match;
  let counter = 1;

  while ((match = mermaidRegex.exec(markdownContent)) !== null) {
    const diagramCode = match[1].trim();
    if (diagramCode) {
      diagrams.push({
        id: counter++,
        code: diagramCode,
      });
    }
  }

  return diagrams;
}

// Générer les images pour un diagramme
function generateImages(diagram, outputDir) {
  const tempFile = path.join(outputDir, `temp-${diagram.id}.mmd`);
  const pngFile = path.join(outputDir, `diagram-${diagram.id}.png`);
  const svgFile = path.join(outputDir, `diagram-${diagram.id}.svg`);

  try {
    // Écrire le diagramme dans un fichier temporaire
    fs.writeFileSync(tempFile, diagram.code, 'utf8');

    // Générer PNG
    console.log(`  📸 Génération PNG pour diagramme ${diagram.id}...`);
    execSync(`mmdc -i "${tempFile}" -o "${pngFile}" -b transparent`, {
      stdio: 'inherit',
    });

    // Générer SVG
    console.log(`  🎨 Génération SVG pour diagramme ${diagram.id}...`);
    execSync(`mmdc -i "${tempFile}" -o "${svgFile}"`, {
      stdio: 'inherit',
    });

    // Supprimer le fichier temporaire
    fs.unlinkSync(tempFile);

    return { success: true, png: pngFile, svg: svgFile };
  } catch (error) {
    // Nettoyer en cas d'erreur
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
    }
    return { success: false, error: error.message };
  }
}

// Fonction principale
function main() {
  console.log('🎨 Génération des images Mermaid...\n');

  // Vérifier que le fichier Markdown existe
  if (!fs.existsSync(MARKDOWN_FILE)) {
    console.error(`❌ Fichier non trouvé: ${MARKDOWN_FILE}`);
    process.exit(1);
  }

  // Vérifier Mermaid CLI
  if (!checkMermaidCLI()) {
    console.error("❌ Mermaid CLI (mmdc) n'est pas installé.");
    console.log('\n📦 Installation:');
    console.log('   npm install -g @mermaid-js/mermaid-cli');
    console.log('   OU');
    console.log('   npm install --save-dev @mermaid-js/mermaid-cli');
    process.exit(1);
  }

  // Créer le dossier images s'il n'existe pas
  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
    console.log(`📁 Dossier créé: ${IMAGES_DIR}\n`);
  }

  // Lire le fichier Markdown
  console.log(`📄 Lecture de ${MARKDOWN_FILE}...`);
  const markdownContent = fs.readFileSync(MARKDOWN_FILE, 'utf8');

  // Extraire les diagrammes
  const diagrams = extractDiagrams(markdownContent);
  console.log(`✅ ${diagrams.length} diagramme(s) trouvé(s)\n`);

  if (diagrams.length === 0) {
    console.log('⚠️  Aucun diagramme Mermaid trouvé dans le fichier.');
    process.exit(0);
  }

  // Générer les images pour chaque diagramme
  let successCount = 0;
  let failCount = 0;

  diagrams.forEach((diagram) => {
    console.log(`\n🖼️  Traitement du diagramme ${diagram.id}...`);
    const result = generateImages(diagram, IMAGES_DIR);

    if (result.success) {
      successCount++;
      console.log(`  ✅ PNG: ${result.png}`);
      console.log(`  ✅ SVG: ${result.svg}`);
    } else {
      failCount++;
      console.error(`  ❌ Erreur: ${result.error}`);
    }
  });

  // Résumé
  console.log('\n' + '='.repeat(50));
  console.log('📊 Résumé:');
  console.log(`  ✅ Succès: ${successCount}`);
  if (failCount > 0) {
    console.log(`  ❌ Échecs: ${failCount}`);
  }
  console.log(`  📁 Images dans: ${IMAGES_DIR}`);
  console.log('='.repeat(50));
}

// Exécuter le script
if (require.main === module) {
  main();
}

module.exports = { extractDiagrams, generateImages };
