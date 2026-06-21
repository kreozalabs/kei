import { activeAdapter } from "./index";
import * as core from "@kreozalabs/core";

export const getLocalWatermarks = () => core.getLocalWatermarks(activeAdapter);
export const getEventsSince = (watermarks: Record<string, number>) =>
  core.getEventsSince(watermarks, activeAdapter);
