const fs = require('fs');
const path = require('path');

const source = path.join(__dirname, '..', 'node_modules', 'motion', 'dist', 'motion.js');
const destDir = path.join(__dirname, '..', 'public', 'vendor');
const dest = path.join(destDir, 'motion.js');

if (!fs.existsSync(source)) {
  console.warn('motion package not installed yet; skipping vendor copy.');
  process.exit(0);
}
fs.mkdirSync(destDir, { recursive: true });
fs.copyFileSync(source, dest);
console.log(`Copied ${source} -> ${dest}`);
