import { rename, rmdir, copyFile } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rootPath = join(__dirname, '..');
const distPath = join(__dirname, '..', 'dist');
const srcIndexPath = join(distPath, 'src', 'index.html');
const appHtmlPath = join(distPath, 'app.html');
const srcDirPath = join(distPath, 'src');

try {
  // Rename the React app
  await rename(srcIndexPath, appHtmlPath);
  console.log('✓ Renamed dist/src/index.html to dist/app.html');
  
  // Remove empty src directory
  await rmdir(srcDirPath);
  console.log('✓ Removed empty dist/src directory');
  
  // Copy static HTML pages
  const staticPages = ['contact.html', 'terms.html'];
  for (const page of staticPages) {
    const sourcePath = join(rootPath, page);
    const destPath = join(distPath, page);
    await copyFile(sourcePath, destPath);
    console.log(`✓ Copied ${page} to dist/`);
  }
  
  // Copy CSS files
  const cssFiles = ['landing.css'];
  for (const css of cssFiles) {
    const sourcePath = join(rootPath, css);
    const destPath = join(distPath, css);
    await copyFile(sourcePath, destPath);
    console.log(`✓ Copied ${css} to dist/`);
  }
} catch (error) {
  console.error('Error during post-build:', error.message);
  process.exit(1);
}
