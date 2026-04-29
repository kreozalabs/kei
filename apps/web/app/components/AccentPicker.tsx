import { useTheme, type Accent } from "../providers/ThemeContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Button,
  cn,
} from "@kreozalabs/ui";
import { PaletteIcon, CheckIcon } from "lucide-react";

const accents: { label: string; value: Accent; color: string }[] = [
  { label: "Blue", value: "blue", color: "bg-[#1e60f2]" },
  { label: "Indigo", value: "indigo", color: "bg-[#6366f1]" },
  { label: "Violet", value: "violet", color: "bg-[#8b5cf6]" },
  { label: "Emerald", value: "emerald", color: "bg-[#10b981]" },
  { label: "Rose", value: "rose", color: "bg-[#f43f5e]" },
  { label: "Amber", value: "amber", color: "bg-[#f59e0b]" },
  { label: "Forest", value: "forest", color: "bg-[#2da44e]" },
];

export function AccentPicker() {
  const { accent, setAccent } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 rounded-md hover:bg-muted/50 border-none text-muted-foreground group"
          title="Change accent color"
        >
          <PaletteIcon className="size-4 group-hover:text-primary transition-colors" />
          <span className="sr-only">Change accent color</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-45 p-2">
        <div className="text-[10px] font-bold text-muted-foreground/60 px-2 py-1 uppercase tracking-wider">
          Appearance
        </div>
        <div className="h-px bg-border/40 my-1 mx-1" />
        {accents.map((item) => (
          <DropdownMenuItem
            key={item.value}
            onClick={() => setAccent(item.value)}
            className="flex items-center justify-between cursor-pointer rounded-sm hover:bg-muted/60 px-2 py-1.5 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <div
                className={cn("size-3 rounded-full shadow-sm ring-1 ring-black/5", item.color)}
              />
              <span
                className={cn(
                  "text-xs transition-colors",
                  accent === item.value ? "font-bold text-primary" : "text-muted-foreground"
                )}
              >
                {item.label}
              </span>
            </div>
            {accent === item.value && <CheckIcon className="size-3 text-primary" strokeWidth={3} />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
