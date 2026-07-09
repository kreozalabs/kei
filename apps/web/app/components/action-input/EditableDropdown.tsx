import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@kreozalabs/kei-ui";
import { PropertyButton } from "./PropertyButton";
import { type ReactNode } from "react";
import { Check } from "lucide-react";

interface DropdownOption<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
}

interface EditableDropdownProps<T extends string> {
  value: T;
  options: DropdownOption<T>[];
  onChange: (value: T) => void;
  icon?: ReactNode;
  placeholder?: string;
  isActive?: boolean;
}

export function EditableDropdown<T extends string>({
  value,
  options,
  onChange,
  icon,
  placeholder = "Select...",
  isActive,
}: EditableDropdownProps<T>) {
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <PropertyButton
          icon={selectedOption?.icon || icon}
          label={selectedOption?.label || placeholder}
          isActive={isActive || !!value}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[140px]">
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onChange(option.value)}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              {option.icon && <span className="text-muted-foreground">{option.icon}</span>}
              <span>{option.label}</span>
            </div>
            {value === option.value && <Check className="text-primary ml-2 size-3" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
