import { Popover, PopoverContent, PopoverTrigger, cn } from "@kreozalabs/kei-ui";
import {
  useComboboxSelect,
  ComboboxTrigger,
  ComboboxContentList,
  type ComboboxSelectProps,
} from "./combobox";

export function ComboboxSelect(props: ComboboxSelectProps) {
  const {
    value,
    searchPlaceholder,
    emptyText,
    footer,
    triggerClassName,
    contentClassName,
    disabled,
    clearable,
    align = "end",
  } = props;

  const combobox = useComboboxSelect(props);

  return (
    <Popover open={combobox.open} onOpenChange={combobox.handleOpenChange}>
      <PopoverTrigger asChild>
        <ComboboxTrigger
          combobox={combobox}
          disabled={disabled}
          clearable={clearable}
          triggerClassName={triggerClassName}
        />
      </PopoverTrigger>
      <PopoverContent
        align={align}
        className={cn(
          "w-[calc(100vw-2rem)] max-w-[440px] p-0 shadow-md sm:w-[440px]",
          contentClassName
        )}
      >
        <ComboboxContentList
          combobox={combobox}
          value={value}
          searchPlaceholder={searchPlaceholder}
          emptyText={emptyText}
          footer={footer}
        />
      </PopoverContent>
    </Popover>
  );
}

export type { ComboboxOption, ComboboxGroup, ComboboxSelectProps } from "./combobox";
export { useComboboxSelect, ComboboxTrigger, ComboboxContentList } from "./combobox";
