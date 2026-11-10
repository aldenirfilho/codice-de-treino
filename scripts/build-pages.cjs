'use strict';

const { copyFileSync, lstatSync, mkdirSync, readFileSync, writeFileSync } = require('node:fs');
const { join, resolve } = require('node:path');

const [output, revision] = process.argv.slice(2);
if (!output || !/^[0-9a-f]{40}$/.test(revision || '')) {
  throw new Error('Uso: node scripts/build-pages.cjs <novo-diretório> <SHA de 40 caracteres>');
}

const source = resolve(__dirname, '..');
const publicFiles = [
  'index.html',
  'app.js',
  'manifest.json',
  'icon.svg',
  'icon-180.png',
  'icon-192.png',
  'icon-512.png',
  'vendor/chart.umd.min.js',
  'vendor/Chart.js-LICENSE.md',
  'vendor/kurkle-color-LICENSE.md'
];

const worker = readFileSync(join(source, 'sw.js'), 'utf8');
const versionLine = /^const CACHE_VERSION = '[^']+'; \/\/ @pages-release$/m;
if (worker.split('// @pages-release').length !== 2 || !versionLine.test(worker)) {
  throw new Error('sw.js deve conter exatamente uma declaração de cache marcada com @pages-release.');
}

for (const file of publicFiles) {
  if (!lstatSync(join(source, file)).isFile()) {
    throw new Error(`O recurso ${file} deve ser um arquivo regular.`);
  }
}

// Um diretório novo impede a publicação de arquivos deixados por um build anterior.
mkdirSync(output);
mkdirSync(join(output, 'vendor'));
for (const file of publicFiles) {
  copyFileSync(join(source, file), join(output, file));
}
writeFileSync(join(output, 'sw.js'), worker.replace(versionLine, `const CACHE_VERSION = '${revision}';`));
