const fs = require('fs');
const path = require('path');

const src = path.resolve(__dirname, '../src/assets/logo.webp');
const destDir = path.resolve(__dirname, '../public');
const dest = path.join(destDir, 'logo.webp');

if (!fs.existsSync(src)) {
  console.error('Fuente logo no encontrada:', src);
  process.exit(1);
}

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

fs.copyFileSync(src, dest);
console.log('Copiado logo a public:', dest);
