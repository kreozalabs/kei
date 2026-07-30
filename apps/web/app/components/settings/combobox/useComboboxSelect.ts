import * as React from "react";
import type { ComboboxGroup, ComboboxOption, ComboboxSelectProps } from "./types";

export function useComboboxSelect({
  value,
  onValueChange,
  onChange,
  options,
  groups,
  searchValue,
  onSearchValueChange,
  placeholder = "Select option...",
  onOpenChange,
}: ComboboxSelectProps) {
  const [openInternal, setOpenInternal] = React.useState(false);
  const [searchInternal, setSearchInternal] = React.useState("");

  const search = searchValue !== undefined ? searchValue : searchInternal;

  const setSearch = React.useCallback(
    (val: string) => {
      onSearchValueChange?.(val);
      if (searchValue === undefined) {
        setSearchInternal(val);
      }
    },
    [onSearchValueChange, searchValue]
  );

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      setOpenInternal(nextOpen);
      onOpenChange?.(nextOpen);
      if (!nextOpen) {
        setSearch("");
      }
    },
    [onOpenChange, setSearch]
  );

  const handleSelect = React.useCallback(
    (val: string) => {
      onValueChange?.(val);
      onChange?.(val);
      handleOpenChange(false);
    },
    [onValueChange, onChange, handleOpenChange]
  );

  const handleClear = React.useCallback(
    (e: React.SyntheticEvent) => {
      e.stopPropagation();
      handleSelect("");
    },
    [handleSelect]
  );

  const deferredSearch = React.useDeferredValue(search);

  const effectiveGroups = React.useMemo<readonly ComboboxGroup[]>(() => {
    if (groups) return groups;
    if (!options) return [];
    if (!deferredSearch.trim()) return [{ options }];

    const q = deferredSearch.toLowerCase().trim();
    const filtered = options.filter(
      (opt) => opt.label.toLowerCase().includes(q) || opt.value.toLowerCase().includes(q)
    );
    return [{ options: filtered }];
  }, [groups, options, deferredSearch]);

  const selectedOption = React.useMemo<ComboboxOption | null>(() => {
    if (!value) return null;
    if (options) {
      const found = options.find((opt) => opt.value === value);
      if (found) return found;
    }
    if (groups) {
      for (const g of groups) {
        const found = g.options.find((opt) => opt.value === value);
        if (found) return found;
      }
    }
    return null;
  }, [value, options, groups]);

  const displayLabel = selectedOption ? selectedOption.label : value ? value : placeholder;
  const isSelected = Boolean(value);

  return {
    open: openInternal,
    handleOpenChange,
    search,
    setSearch,
    handleSelect,
    handleClear,
    effectiveGroups,
    selectedOption,
    displayLabel,
    isSelected,
  };
}

export type UseComboboxSelectReturn = ReturnType<typeof useComboboxSelect>;
