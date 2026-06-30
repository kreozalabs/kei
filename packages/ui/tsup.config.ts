import { defineConfig } from "tsup";
import fs from "node:fs";
import path from "node:path";

// NOTE: Auto-generate src/index.ts to avoid manual maintenance
const srcDir = path.resolve(__dirname, "src");
const componentsDir = path.resolve(srcDir, "components");
const utilsFile = path.resolve(srcDir, "lib/utils.ts");
const hooksDir = path.resolve(srcDir, "hooks");

function getExportableFiles(dir: string, ext: string, basePath = ""): string[] {
  let results: string[] = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of list) {
    const fullPath = path.join(dir, file.name);
    const relativePath = basePath ? `${basePath}/${file.name}` : file.name;
    if (file.isDirectory()) {
      results = results.concat(getExportableFiles(fullPath, ext, relativePath));
    } else if (
      file.isFile() &&
      file.name.endsWith(ext) &&
      !file.name.endsWith(`.test${ext}`) &&
      !file.name.endsWith(`.spec${ext}`) &&
      !file.name.includes(".stories.") &&
      file.name !== "index.ts"
    ) {
      results.push(relativePath);
    }
  }
  return results;
}

const components = getExportableFiles(componentsDir, ".tsx").map(
  (f) => `export * from "./components/${f.replace(".tsx", "")}";`
);

const hooks = getExportableFiles(hooksDir, ".ts").map(
  (f) => `export * from "./hooks/${f.replace(".ts", "")}";`
);

const exports = [...components, ...hooks];
if (fs.existsSync(utilsFile)) {
  exports.push('export * from "./lib/utils";');
}

fs.writeFileSync(path.resolve(srcDir, "index.ts"), exports.join("\n") + "\n");

export default defineConfig({
  entry: ["src/index.ts", "src/components/rich-editor/ai/ai-worker.ts"],
  format: ["cjs", "esm"],
  dts: true,
  clean: true,
  external: ["react", "react-dom"],
  sourcemap: true,
});
