import { build } from "esbuild"
import { solidPlugin } from "esbuild-plugin-solid"
import { copy } from "esbuild-plugin-copy"
import glob from "tiny-glob"
import postcss from "esbuild-postcss"

// Assets
await build({
  bundle: true,
  plugins: [copy({
    resolveFrom: "cwd",
    assets: {
      from: ["./public/*"],
      to: ["./dist"],
    },
  })]
})

// FE
await build({
  bundle: true,
  entryPoints: [
    "./src/fe/index.tsx",
    ...await glob("./src/fe/pages/**/*.*")
  ],
  outdir: "./dist",
  // minify: true,
  plugins: [solidPlugin(), postcss()],
  format: "esm",
})

// API
await build({
  bundle: true,
  entryPoints: ["./src/api/index.ts"],
  format: "esm",
  // minify: true,
  outfile: "./dist/_worker.js"
})
