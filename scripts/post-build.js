import { rename, rmdir } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const distPath = join(__dirname, '..', 'dist');
const srcIndexPath = join(distPath, 'src', 'index.html');
const appHtmlPath = join(distPath, 'app.html');
const srcDirPath = join(distPath, 'src');

try {
  await rename(srcIndexPath, appHtmlPath);
  console.log('✓ Renamed dist/src/index.html to dist/app.html');
  
  await rmdir(srcDirPath);
  console.log('✓ Removed empty dist/src directory');
} catch (error) {
  console.error('Error during post-build:', error.message);
  process.exit(1);
}
