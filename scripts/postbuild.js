import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');

// Copy dist/index.html to root as backup for Netlify if publish dir is "."
if (fs.existsSync(path.join(distDir, 'index.html'))) {
  fs.copyFileSync(
    path.join(distDir, 'index.html'),
    path.join(rootDir, 'index.html')
  );
  console.log('✓ Synced dist/index.html to root index.html for Netlify root publishing');
}

// Ensure assets directory exists in root
const distAssets = path.join(distDir, 'assets');
const rootAssets = path.join(rootDir, 'assets');

if (fs.existsSync(distAssets)) {
  if (!fs.existsSync(rootAssets)) {
    fs.mkdirSync(rootAssets, { recursive: true });
  }
  const files = fs.readdirSync(distAssets);
  for (const file of files) {
    fs.copyFileSync(path.join(distAssets, file), path.join(rootAssets, file));
  }
  console.log(`✓ Synced ${files.length} asset files to root /assets/`);
}
