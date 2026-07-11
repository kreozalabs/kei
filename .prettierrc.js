import labsConfig from "@kreozalabs/prettier-config";

export default {
  ...labsConfig,
  plugins: [...(labsConfig.plugins || []), "prettier-plugin-tailwindcss"],
};
