import { defineConfig, type UserConfig } from "tsdown";

const config: UserConfig = defineConfig({
  entry: "src/index.ts",
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  outDir: "dist",
  target: "node20",
  fixedExtension: false,
  platform: "node",
  treeshake: true,
  sourcemap: false,
  shims: false,
  hash: false,
});

export default config;
