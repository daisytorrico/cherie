const fs = require('fs');
const path = require('path');

const src = path.resolve(__dirname, '../src/assets/hero1.opt.webp');
const destDir = path.resolve(__dirname, '../public');
const dest = path.join(destDir, 'hero1.webp');

if (!fs.existsSync(src)) {
  console.error('Fuente optimizada no encontrada:', src);
  process.exit(1);
}

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

fs.copyFileSync(src, dest);
console.log('Copiada hero optimizada a public:', dest);
