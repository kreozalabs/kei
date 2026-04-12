---
trigger: glob
globs: *.tsx,.ts
---

# UI Architecture & Component Guidelines

## 1. UI Component Usage

- **NEVER** use native HTML elements for interactive or styled components. This includes:
  - `<button>` (Use `<Button>` from `@kreozalabs/ui` instead)
  - `<input>` (Use `<Input>` from `@kreozalabs/ui` instead)
  - `<select>` (Use `<Select>` from `@kreozalabs/ui` instead)
  - `<a>` (Use the framework-appropriate `<Link>` wrapper or a custom anchor component)
- **ALWAYS** import and use the custom components from our UI library (e.g., `import { Button } from "@kreozalabs/ui"`).
- If a required UI component is missing, build it as a reusable component inside the UI package first rather than creating an ad-hoc local implementation.

## 2. Styling Rules

- **ALWAYS** use Tailwind CSS utility classes via the `cn()` utility if conditional logic is needed.
- **NEVER** use inline React styles (`style={{ ... }}`).
- **Use Theme Tokens:** Always prioritize semantic theme variables (e.g., `bg-primary`, `text-muted-foreground`, `border-border`) over hardcoded hex values or arbitrary colors.

## 3. General AI Instructions

- When fixing visual inconsistencies, investigate the core `@kreozalabs/ui` component first before overriding classes in the consumer app.
- Ensure accessibility (ARIA roles, keyboard navigation) is preserved or enhanced when editing custom components.
