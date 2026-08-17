// Configuração do service worker (PWA).
//
// O Next 16 compila com Turbopack, e o plugin webpack do Serwist não roda nesse
// modo. Por isso usamos o "configurator mode": o SW é montado por um passo
// próprio depois do `next build` (veja o script `build:sw` no package.json).
import { serwist } from "@serwist/next/config";

export default await serwist({
  swSrc: "src/service-worker/index.ts",
  swDest: "public/sw.js",
  globDirectory: ".",
  // Não precacheia o HTML pré-renderizado: as rotas do app são privadas e
  // dependem de sessão. O fallback de navegação offline é a página /offline.
  precachePrerendered: false,
  globPatterns: [
    ".next/static/**/*.{js,css,woff2}",
    "public/icons/*.png",
    "public/manifest.json",
    "public/apple-touch-icon.png",
    ".next/server/app/offline.html",
  ],
  maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
});
