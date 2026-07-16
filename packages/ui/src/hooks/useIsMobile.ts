import { useMediaQuery } from "./useMediaQuery";

export function useIsMobile(maxWidth: string = "768px") {
  return useMediaQuery(`(max-width: ${maxWidth})`);
}
