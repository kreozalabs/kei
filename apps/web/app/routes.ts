import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  // 1. Landing / Marketing (Root level URLs)
  layout("routes/marketing/_layout.tsx", [
    index("routes/marketing/home.tsx"),
  ]),

  // 2. Main App (Prefixed with /app or /dashboard)
  route("app", "routes/app/_layout.tsx", [
    index("routes/app/dashboard.tsx"),
  ]),

  // 3. Documentation (Prefixed with /docs)
  route("docs", "routes/docs/_layout.tsx", [
    // Placeholder for docs routing
  ]),
] satisfies RouteConfig;
