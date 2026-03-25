// convertImages.js
import sharp from 'sharp';
import { readdirSync, statSync } from 'fs';
import { join, extname, basename } from 'path';

const INPUT_DIR = './src/assets'; // cambia esto a tu carpeta de imágenes

function getFiles(dir) {
  const files = [];
  readdirSync(dir).forEach(file => {
    const fullPath = join(dir, file);
    if (statSync(fullPath).isDirectory()) {
      files.push(...getFiles(fullPath)); // busca en subcarpetas
    } else {
      files.push(fullPath);
    }
  });
  return files;
}

const files = getFiles(INPUT_DIR).filter(f => 
  ['.png', '.jpg', '.jpeg', '.svg'].includes(extname(f).toLowerCase())
);

for (const file of files) {
  const output = join(
    file.replace(basename(file), ''),
    basename(file, extname(file)) + '.webp'
  );

  await sharp(file)
    .webp({ quality: 80 })
    .toFile(output);

  console.log(`✓ ${file} → ${output}`);
}

console.log(`\nConvertidas ${files.length} imágenes`);