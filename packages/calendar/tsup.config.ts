import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/core/index.ts",
    "src/plugins/recurrence/src/index.ts",
    "src/plugins/agenda/src/index.ts",
    "src/plugins/drag-to-create/src/index.ts"
  ],
  format: ["cjs", "esm"],
  dts: true,
  clean: true,
  external: ["react", "react-dom", "dayjs"],
  sourcemap: true,
});
