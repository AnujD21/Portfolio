import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { ui } from "./src/i18n/ui";

/**
 * Emits dist/ja/index.html: the same app with Japanese <html lang>, title and descriptions,
 * so /ja is indexed and previewed in Japanese. The app itself picks the language from the URL.
 */
function japaneseEntry(): Plugin {
  return {
    name: "japanese-entry",
    apply: "build",
    enforce: "post",
    generateBundle(_, bundle) {
      const page = bundle["index.html"];
      if (!page || page.type !== "asset") return;
      const { title, description } = ui.ja.meta;
      const html = String(page.source)
        .replace('<html lang="en">', '<html lang="ja">')
        .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
        .replace(/(name="description"\s+content=")[^"]*/, `$1${description}`)
        .replace(/(property="og:title"\s+content=")[^"]*/, `$1${title}`)
        .replace(/(property="og:description"\s+content=")[^"]*/, `$1${description}`)
        .replace(/(property="og:locale"\s+content=")[^"]*/, "$1ja_JP")
        .replace(/(property="og:url"\s+content=")[^"]*/, "$1https://anujdas.vercel.app/ja");
      this.emitFile({ type: "asset", fileName: "ja/index.html", source: html });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), japaneseEntry()],
  build: {
    target: "es2022",
    // The Three.js scene is a lazy chunk (~250 kB gzip) loaded behind the preloader.
    chunkSizeWarningLimit: 1000,
  },
});
