import { SearchIcon } from "lucide-react";
import { Button } from "@kreozalabs/kei-ui";

export function HeaderSearch() {
  return (
    <Button variant="ghost" size="icon" className="size-10">
      <SearchIcon className="size-5" />
    </Button>
  );
}
