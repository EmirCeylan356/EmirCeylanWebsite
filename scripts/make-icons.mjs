// Generate the favicon/PWA icon set from public/favicon.svg with sharp.
// Run: node scripts/make-icons.mjs   (outputs into public/)
import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'node:fs';
const svg = readFileSync('public/favicon.svg');
const out = async (size, file) => { await sharp(svg, { density: 384 }).resize(size, size).png().toFile(file); console.log('wrote', file); };
await out(180, 'public/apple-touch-icon.png');
await out(192, 'public/icon-192.png');
await out(512, 'public/icon-512.png');
// favicon.ico: a 32px PNG wrapped in an ICO container (single image).
const png32 = await sharp(svg, { density: 384 }).resize(32, 32).png().toBuffer();
const header = Buffer.alloc(6); header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(1, 4);
const entry = Buffer.alloc(16); entry.writeUInt8(32, 0); entry.writeUInt8(32, 1); entry.writeUInt8(0, 2); entry.writeUInt8(0, 3);
entry.writeUInt16LE(1, 4); entry.writeUInt16LE(32, 6); entry.writeUInt32LE(png32.length, 8); entry.writeUInt32LE(22, 12);
writeFileSync('public/favicon.ico', Buffer.concat([header, entry, png32])); console.log('wrote public/favicon.ico');
