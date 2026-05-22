# @kreozalabs/ui

The core React component library for Kreoza Labs. This package provides foundational UI building blocks (buttons, dialogs, inputs, etc.) intended to be consumed by our web, desktop (Tauri), and mobile applications.

## 📦 Installation

This package is intended to be consumed within the Kreoza Labs monorepo workspace.

```bash
pnpm add @kreozalabs/ui
```

### Peer Dependencies

Ensure the consuming application has the following installed:

- `react`
- `react-dom`
- `tailwindcss`
- Tailwind CSS v4 (included)

## 🚀 Usage

Import components directly from the package into your React app.

```tsx
import { Button } from "@kreozalabs/ui";

export default function App() {
  return (
    <div className="p-4">
      <Button variant="default">Click Me</Button>
    </div>
  );
}
```

## 🛠️ Configuration

Import the styles in your main entry point:

```css
@import "@kreozalabs/ui/index.css";
```
