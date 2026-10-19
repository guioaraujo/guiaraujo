// Gera os ícones do PWA a partir de public/icon.svg.
// Uso: npm run icons
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const src = "public/icon.svg";
await mkdir("public/icons", { recursive: true });

const targets = [
  { out: "public/icons/icon-192.png", size: 192, pad: 0 },
  { out: "public/icons/icon-512.png", size: 512, pad: 0 },
  // Maskable: conteúdo dentro da zona segura (80% central).
  { out: "public/icons/icon-maskable-512.png", size: 512, pad: 64 },
  { out: "public/apple-touch-icon.png", size: 180, pad: 0 },
];

for (const t of targets) {
  const inner = t.size - t.pad * 2;
  const icon = await sharp(src).resize(inner, inner).png().toBuffer();
  await sharp({
    create: { width: t.size, height: t.size, channels: 4, background: "#D97B3C" },
  })
    .composite([{ input: icon, left: t.pad, top: t.pad }])
    .png()
    .toFile(t.out);
  console.log("ok", t.out);
}
