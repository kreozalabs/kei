import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  // 1. Landing / Marketing (Root level URLs)
  layout("routes/marketing/_layout.tsx", [
    index("routes/marketing/home.tsx"),
    route("*", "routes/marketing/not-found.tsx"),
  ]),

  // 2. Main App (Prefixed with /app or /dashboard)
  route("app", "routes/app/_layout.tsx", [
    index("routes/app/dashboard.tsx"),
    route("inbox", "routes/app/inbox.tsx"),
    route("me", "routes/app/me.tsx"),
    route("settings", "routes/app/settings.tsx"),
    route("*", "routes/app/not-found.tsx"),
  ]),

  // 3. Documentation (Prefixed with /docs)
  route("docs", "routes/docs/_layout.tsx", [route("*", "routes/docs/not-found.tsx")]),
] satisfies RouteConfig;
