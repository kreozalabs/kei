/// <reference types="vite/client" />
/// <reference types="react-router" />

declare module "*.png" {
  const content: string;
  export default content;
}

declare module "*.svg" {
  const content: string;
  export default content;
}
