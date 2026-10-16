import { mkdir, readFile, writeFile } from 'node:fs/promises';
const source = await readFile(new URL('../src/glowfloor-card.js', import.meta.url), 'utf8');
await mkdir(new URL('../dist/', import.meta.url), { recursive: true });
await writeFile(new URL('../dist/glowfloor-card.js', import.meta.url), source);
console.log(`Built dist/glowfloor-card.js (${Buffer.byteLength(source)} bytes)`);
