const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function optimize() {
  const src = path.resolve(__dirname, '../src/assets/hero1.webp');
  const dest = path.resolve(__dirname, '../src/assets/hero1.opt.webp');
  if (!fs.existsSync(src)) {
    console.error('No existe', src);
    process.exit(1);
  }
  try {
    await sharp(src).resize({ width: 1600 }).webp({ quality: 75 }).toFile(dest);
    console.log('Optimized written to', dest);
  } catch (err) {
    console.error('Error optimizing:', err);
    process.exit(1);
  }
}

optimize();
