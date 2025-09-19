const fs = require('fs');
const path = require('path');

// Créer le dossier logs s'il n'existe pas
const logsDir = path.join(process.cwd(), 'logs');

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
  console.log('✅ Dossier logs créé');
} else {
  console.log('📁 Dossier logs existe déjà');
}

// Créer les fichiers de log s'ils n'existent pas
const logFiles = [
  'error.log',
  'combined.log',
  'http.log',
  'performance.log',
  'web3.log'
];

logFiles.forEach(file => {
  const filePath = path.join(logsDir, file);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '');
    console.log(`✅ Fichier ${file} créé`);
  }
});

console.log('📊 Système de logs configuré');
