import { db } from "./index";
import { v7 as uuidv7 } from "uuid";
import type { Action, Event, ActionPayload } from "../types/events";

const getTodayString = () => new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD local time

export async function getActions(): Promise<Action[]> {
  const result = await db.query(`SELECT * FROM events ORDER BY timestamp ASC`);
  const events = result.rows as Event<ActionPayload>[];

  const actionsMap = new Map<string, Action>();

  for (const event of events) {
    const actionId = event.id; // Now event.id is our entity id
    if (event.type === "ACTION_INTENDED") {
      actionsMap.set(actionId, {
        id: actionId,
        title: event.payload.title || "Untitled",
        note: event.payload.note,
        intention: event.payload.intention || "want",
        important: event.payload.important || false,
        energy: event.payload.energy || "medium",
        duration: event.payload.duration,
        scheduledDate: event.payload.scheduledDate || getTodayString(),
        startTime: event.payload.startTime,
        endTime: event.payload.endTime,
        status: "active",
        createdAt: event.timestamp,
        sortOrder: event.payload.sortOrder ?? event.timestamp,
      });
    } else if (event.type === "ACTION_UPDATED") {
      const existing = actionsMap.get(actionId);
      if (existing) {
        actionsMap.set(actionId, { ...existing, ...event.payload });
      }
    } else if (event.type === "ACTION_COMPLETED") {
      const existing = actionsMap.get(actionId);
      if (existing) {
        existing.status = "completed";
      }
    } else if (event.type === "ACTION_ABANDONED") {
      const existing = actionsMap.get(actionId);
      if (existing) {
        existing.status = "abandoned";
      }
    }
  }

  return Array.from(actionsMap.values()).sort((a, b) => b.sortOrder - a.sortOrder);
}

export async function addAction(payload: ActionPayload) {
  const actionId = uuidv7();
  const event: Event<ActionPayload> = {
    eventId: uuidv7(),
    id: actionId,
    type: "ACTION_INTENDED",
    timestamp: Date.now(),
    payload: {
      ...payload,
      scheduledDate: payload.scheduledDate || getTodayString(),
      sortOrder: payload.sortOrder ?? Date.now(),
    },
  };

  await db.query(
    "INSERT INTO events (event_id, id, type, timestamp, payload) VALUES ($1, $2, $3, $4, $5)",
    [event.eventId, event.id, event.type, event.timestamp, JSON.stringify(event.payload)]
  );
  return actionId;
}

export async function updateAction(id: string, payload: Partial<ActionPayload>) {
  const event: Event<Partial<ActionPayload>> = {
    eventId: uuidv7(),
    id,
    type: "ACTION_UPDATED",
    timestamp: Date.now(),
    payload,
  };

  await db.query(
    "INSERT INTO events (event_id, id, type, timestamp, payload) VALUES ($1, $2, $3, $4, $5)",
    [event.eventId, event.id, event.type, event.timestamp, JSON.stringify(event.payload)]
  );
}

export async function completeAction(id: string) {
  const event = {
    eventId: uuidv7(),
    id,
    type: "ACTION_COMPLETED",
    timestamp: Date.now(),
    payload: {},
  };

  await db.query(
    "INSERT INTO events (event_id, id, type, timestamp, payload) VALUES ($1, $2, $3, $4, $5)",
    [event.eventId, event.id, event.type, event.timestamp, JSON.stringify(event.payload)]
  );
}

export async function abandonAction(id: string) {
  const event = {
    eventId: uuidv7(),
    id,
    type: "ACTION_ABANDONED",
    timestamp: Date.now(),
    payload: {},
  };

  await db.query(
    "INSERT INTO events (event_id, id, type, timestamp, payload) VALUES ($1, $2, $3, $4, $5)",
    [event.eventId, event.id, event.type, event.timestamp, JSON.stringify(event.payload)]
  );
}
export async function getRecentConfigs(): Promise<ActionPayload[]> {
  const result = await db.query(`SELECT payload FROM events WHERE type = 'ACTION_INTENDED' ORDER BY timestamp DESC LIMIT 30`);
  const payloads = result.rows.map(r => JSON.parse(r.payload as string)) as ActionPayload[];
  
  const configs: ActionPayload[] = [];
  const seen = new Set<string>();

  for (const payload of payloads) {
    const configKey = JSON.stringify({
      intention: payload.intention || "want",
      energy: payload.energy || "medium",
      duration: payload.duration,
      important: payload.important || false,
    });

    if (!seen.has(configKey)) {
      seen.add(configKey);
      configs.push({
        intention: payload.intention || "want",
        energy: payload.energy || "medium",
        duration: payload.duration,
        important: payload.important || false,
      });
    }
    if (configs.length >= 4) break;
  }

  return configs;
}

export async function getLastKnownTime(id: string): Promise<{startTime: string, endTime?: string | null} | null> {
  const result = await db.query(
    `SELECT payload FROM events WHERE id = $1 AND (type = 'ACTION_INTENDED' OR type = 'ACTION_UPDATED') ORDER BY timestamp DESC`,
    [id]
  );
  
  for (const row of result.rows) {
    const payload = JSON.parse(row.payload as string) as Partial<ActionPayload>;
    // Check if this payload has startTime defined and not null/empty string
    if (payload.startTime) {
      return {
        startTime: payload.startTime,
        endTime: payload.endTime
      };
    }
  }
  return null;
}
