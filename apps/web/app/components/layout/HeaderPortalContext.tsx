import { createContext, useContext } from "react";

export const HeaderPortalContext = createContext<HTMLElement | null>(null);

export function useHeaderPortalTarget() {
  return useContext(HeaderPortalContext);
}
