// One-shot optimizer: src/assets/**/*.{jpg,jpeg,png} -> .webp (sharp).
// - photos: max width 1920, quality 80
// - decor line-art: quality 85 (crisp edges)
// - partner logos: max width 640, quality 85 (alpha preserved)
// - public/og-cover.jpg: 1200x630 cover from lahlou-hero.jpg (OG scrapers
//   prefer jpg/png over webp)
// Usage: node scripts/optimize-images.mjs
// After running: update imports (.jpg/.png -> .webp), delete originals, rebuild.

import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const ASSETS = path.join(ROOT, "src", "assets");

async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else yield p;
  }
}

let totalBefore = 0;
let totalAfter = 0;

for await (const file of walk(ASSETS)) {
  const ext = path.extname(file).toLowerCase();
  if (![".jpg", ".jpeg", ".png"].includes(ext)) continue;
  const base = file.slice(0, -ext.length);
  const out = `${base}.webp`;
  const isPartner = file.includes(`${path.sep}partners${path.sep}`);
  const before = (await stat(file)).size;
  const pipe = sharp(file).rotate();
  if (isPartner) pipe.resize({ width: 640, withoutEnlargement: true });
  else pipe.resize({ width: 1920, withoutEnlargement: true });
  await pipe.webp({ quality: isPartner ? 85 : 80 }).toFile(out);
  const after = (await stat(out)).size;
  totalBefore += before;
  totalAfter += after;
  console.log(
    `${path.relative(ROOT, file)}: ${(before / 1024).toFixed(0)}KB -> ${(after / 1024).toFixed(0)}KB`,
  );
}

// OG cover 1200x630
const hero = path.join(ASSETS, "lahlou-hero.jpg");
const ogOut = path.join(ROOT, "public", "og-cover.jpg");
await sharp(hero).rotate().resize(1200, 630, { fit: "cover" }).jpeg({ quality: 82 }).toFile(ogOut);
console.log(`public/og-cover.jpg: ${((await stat(ogOut)).size / 1024).toFixed(0)}KB`);
console.log(
  `TOTAL assets: ${(totalBefore / 1024 / 1024).toFixed(1)}MB -> ${(totalAfter / 1024 / 1024).toFixed(1)}MB`,
);
