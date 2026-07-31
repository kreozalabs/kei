import * as React from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  cn,
} from "@kreozalabs/kei-ui";
import { Check } from "lucide-react";
import type { UseComboboxSelectReturn } from "./useComboboxSelect";

export interface ComboboxContentListProps {
  combobox: UseComboboxSelectReturn;
  value?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  footer?: React.ReactNode;
}

export function ComboboxContentList({
  combobox,
  value,
  searchPlaceholder = "Search...",
  emptyText = "No option found.",
  footer,
}: ComboboxContentListProps) {
  const { search, setSearch, effectiveGroups, handleSelect } = combobox;
  const isAllGroupsEmpty = effectiveGroups.every((g) => g.options.length === 0);

  // FIXME: Fix keyboard navigation focus highlight for Combobox options
  return (
    <Command shouldFilter={false}>
      <CommandInput
        autoFocus
        placeholder={searchPlaceholder}
        value={search}
        onValueChange={setSearch}
      />
      <CommandList className="max-h-72 overflow-y-auto p-1">
        {isAllGroupsEmpty ? (
          <CommandEmpty>{emptyText}</CommandEmpty>
        ) : (
          effectiveGroups.map((group, gIdx) => (
            <CommandGroup key={group.heading || gIdx} heading={group.heading}>
              {group.options.map((opt) => {
                const itemIsSelected = value === opt.value;
                return (
                  <CommandItem
                    key={opt.value}
                    value={opt.value}
                    onSelect={() => handleSelect(opt.value)}
                    className="flex cursor-pointer items-center justify-between py-1.5 text-xs sm:text-sm"
                  >
                    <span className="leading-snug wrap-break-word whitespace-normal sm:whitespace-nowrap">
                      {opt.label}
                    </span>
                    <Check
                      className={cn(
                        "ml-2 size-4 shrink-0 transition-opacity",
                        itemIsSelected ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                );
              })}
            </CommandGroup>
          ))
        )}
        {footer}
      </CommandList>
    </Command>
  );
}
