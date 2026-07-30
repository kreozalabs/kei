import * as React from "react";

export interface ComboboxOption {
  value: string;
  label: string;
  [key: string]: any;
}

export interface ComboboxGroup {
  heading?: string;
  options: readonly ComboboxOption[];
}

export interface ComboboxSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  onChange?: (value: string) => void;
  options?: readonly ComboboxOption[];
  groups?: readonly ComboboxGroup[];
  searchValue?: string;
  onSearchValueChange?: (search: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  footer?: React.ReactNode;
  triggerClassName?: string;
  contentClassName?: string;
  disabled?: boolean;
  clearable?: boolean;
  align?: "start" | "center" | "end";
  onOpenChange?: (open: boolean) => void;
}
