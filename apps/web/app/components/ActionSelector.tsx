import * as React from "react"
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem,
  Button,
  cn
} from "@kreozalabs/ui"

export interface ActionSelectorOption {
  label: string
  value: any
  icon?: React.ReactNode
  className?: string
}

export interface ActionSelectorProps {
  icon?: React.ReactNode
  label: string
  options: ActionSelectorOption[]
  onSelect: (value: any) => void
  variant?: "outline" | "ghost" | "secondary" | "default"
  triggerClassName?: string
  contentClassName?: string
}

export function ActionSelector({
  icon,
  label,
  options,
  onSelect,
  variant = "outline",
  triggerClassName,
  contentClassName
}: ActionSelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          type="button" 
          variant={variant} 
          size="sm" 
          className={cn(
            "h-8 flex flex-row items-center justify-center gap-2 rounded-lg border-border/30 hover:bg-muted/50 px-2.5 transition-all outline-none whitespace-nowrap", 
            triggerClassName
          )}
        >
          {icon}
          <span className="text-[12px] font-semibold text-muted-foreground/80">{label}</span>
          <span className="text-[10px] opacity-30">▼</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className={cn("rounded-2xl p-1.5 shadow-2xl border-border/40 backdrop-blur-xl", contentClassName)}>
        {options.map((option, index) => (
          <DropdownMenuItem 
            key={index} 
            onClick={() => onSelect(option.value)} 
            className={cn("rounded-xl gap-3 px-3 py-2 font-bold focus:bg-primary/5 focus:text-primary", option.className)}
          >
            {option.icon}
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
