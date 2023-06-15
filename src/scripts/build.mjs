import * as esbuild from "esbuild";

const shared = {
  entryPoints: ["src/index.ts"],
  target: "es2016",
  bundle: true,
  minify: true,
  sourcemap: true,
  platform: "neutral",
};

await esbuild.build({
  ...shared,
  outfile: "dist/index.mjs",
});

await esbuild.build({
  ...shared,
  outfile: "dist/index.cjs",
  format: "cjs",
});
