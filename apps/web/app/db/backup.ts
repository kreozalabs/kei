import { activeAdapter } from "./index";
import * as core from "@kreozalabs/kei-core";
import type { Event } from "@kreozalabs/kei-core";

export const exportEvents = () => core.exportEvents(activeAdapter);
export const importEvents = (events: Event[]) => core.importEvents(events, activeAdapter);
