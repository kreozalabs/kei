import { defineConfig } from "tsup";
import fs from "node:fs";
import path from "node:path";

// NOTE: Auto-generate src/index.ts to avoid manual maintenance
const srcDir = path.resolve(__dirname, "src");
const componentsDir = path.resolve(srcDir, "components");
const utilsFile = path.resolve(srcDir, "lib/utils.ts");
const hooksDir = path.resolve(srcDir, "hooks");

const components = fs
  .readdirSync(componentsDir)
  .filter((f) => f.endsWith(".tsx") && f !== "index.ts")
  .map((f) => `export * from "./components/${f.replace(".tsx", "")}";`);

const hooks = fs
  .readdirSync(hooksDir)
  .filter((f) => f.endsWith(".ts") && f !== "index.ts")
  .map((f) => `export * from "./hooks/${f.replace(".ts", "")}";`);

const exports = [...components, ...hooks];
if (fs.existsSync(utilsFile)) {
  exports.push('export * from "./lib/utils";');
}

fs.writeFileSync(path.resolve(srcDir, "index.ts"), exports.join("\n") + "\n");

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  clean: true,
  external: ["react", "react-dom"],
  sourcemap: true,
});
