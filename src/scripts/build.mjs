import * as esbuild from "esbuild";

const shared = {
  entryPoints: ["src/index.ts"],
  target: "es2016",
  bundle: true,
  minify: true,
  sourcemap: true,
};

await esbuild.build({
  ...shared,
  outfile: "dist/index.js",
});

await esbuild.build({
  ...shared,
  outfile: "dist/index.esm.js",
  format: "esm",
});
