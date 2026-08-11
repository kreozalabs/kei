import type { Event, EventType } from "@kreozalabs/kei-core";

export type PluginPermission =
  | "events:subscribe"
  | "events:emit"
  | "storage:local"
  | "ui:widget"
  | "network:fetch";

export interface PluginSlot {
  type: "dashboard_widget" | "command" | "sidebar_tab" | "form_field";
  id: string;
  title: string;
}

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  permissions: PluginPermission[];
  slots: PluginSlot[];
}

export interface KeiPluginContext {
  manifest: PluginManifest;
  events: {
    subscribe: <T = unknown>(
      type: EventType | string,
      handler: (event: Event<T>) => void
    ) => () => void;
    emit: <T = unknown>(
      type: EventType | string,
      id: string,
      payload: T
    ) => Promise<Event<T>>;
  };
  storage: {
    get: <T>(key: string) => Promise<T | null>;
    set: <T>(key: string, value: T) => Promise<void>;
  };
  ui: {
    registerWidget: (
      slotId: string,
      render: () => { title: string; content: string }
    ) => void;
  };
}

export interface KeiPlugin {
  manifest: PluginManifest;
  activate(context: KeiPluginContext): void | Promise<void>;
  deactivate(): void | Promise<void>;
}
