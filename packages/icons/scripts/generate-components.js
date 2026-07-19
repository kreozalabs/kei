import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { transform } from "@svgr/core";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ASSETS_DIR = path.resolve(__dirname, "../assets");
const OUTPUT_DIR = path.resolve(__dirname, "../src/components");
const INDEX_FILE = path.resolve(__dirname, "../src");

function toPascalCase(str) {
  return str.replace(/(?:^|-)([a-z0-9])/g, (_, g) => g.toUpperCase()).replace(/\.svg$/, "");
}

async function run() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  } else {
    const files = fs.readdirSync(OUTPUT_DIR);
    for (const file of files) {
      if (file.endsWith(".tsx")) {
        fs.unlinkSync(path.join(OUTPUT_DIR, file));
      }
    }
  }

  const svgFiles = fs.readdirSync(ASSETS_DIR).filter((file) => file.endsWith(".svg"));
  const exports = [];

  const configPath = path.join(__dirname, "icon-config.json");
  const iconConfig = fs.existsSync(configPath)
    ? JSON.parse(fs.readFileSync(configPath, "utf-8"))
    : {};

  for (const file of svgFiles) {
    const rawSvg = fs.readFileSync(path.join(ASSETS_DIR, file), "utf-8");
    const componentName = toPascalCase(file);

    let processedSvg = rawSvg;
    const fileConfig = iconConfig[file];

    if (fileConfig && fileConfig.rawReplacements) {
      for (const replacement of fileConfig.rawReplacements) {
        const search = replacement.isRegex ? new RegExp(replacement.search) : replacement.search;
        processedSvg = processedSvg.replace(search, replacement.replace);
      }
    }

    // Parse width and height to add viewBox if missing
    if (!processedSvg.includes("viewBox=")) {
      const widthMatch = processedSvg.match(/width="(\d+)"/);
      const heightMatch = processedSvg.match(/height="(\d+)"/);
      if (widthMatch && heightMatch) {
        const w = widthMatch[1];
        const h = heightMatch[1];
        processedSvg = processedSvg.replace("<svg", `<svg viewBox="0 0 ${w} ${h}"`);
      }
    }

    let jsx = await transform(
      processedSvg,
      {
        plugins: ["@svgr/plugin-svgo", "@svgr/plugin-jsx"],
        icon: true,
        typescript: true,
        expandProps: "end",
        exportType: "named",
        replaceAttrValues: {
          "#000": "currentColor",
          black: "currentColor",
        },
      },
      { componentName }
    );

    if (fileConfig && fileConfig.jsxReplacements) {
      for (const replacement of fileConfig.jsxReplacements) {
        const search = replacement.isRegex
          ? new RegExp(replacement.search, "g")
          : replacement.search;
        jsx = jsx.replace(search, replacement.replace);
      }
    }

    fs.writeFileSync(path.join(OUTPUT_DIR, `${componentName}.tsx`), jsx);
    exports.push(`export * from "./components/${componentName}";`);
  }

  fs.writeFileSync(path.join(INDEX_FILE, "index.ts"), exports.join("\n") + "\n");
  console.log(`Generated ${svgFiles.length} icon components.`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
