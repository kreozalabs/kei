import { activeAdapter } from "./index";
import * as core from "@kreozalabs/kei-core";

export const getLocalWatermarks = () => core.getLocalWatermarks(activeAdapter);
export const getEventsSince = (watermarks: Record<string, number>) =>
  core.getEventsSince(watermarks, activeAdapter);
