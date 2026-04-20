import { db } from "./index";
import { v7 as uuidv7 } from "uuid";
import type { Action, Event, ActionPayload } from "../types/events";

const getTodayString = () => new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD local time

export async function getActions(): Promise<Action[]> {
  const result = await db.query(`SELECT * FROM events ORDER BY timestamp ASC`);
  const events = result.rows as Event<ActionPayload>[];

  const actionsMap = new Map<string, Action>();

  for (const event of events) {
    if (event.type === "ACTION_INTENDED") {
      actionsMap.set(event.id, {
        id: event.id,
        title: event.payload.title || "Untitled",
        note: event.payload.note,
        intention: event.payload.intention || "want",
        important: event.payload.important || false,
        energy: event.payload.energy || "medium",
        duration: event.payload.duration,
        scheduledDate: event.payload.scheduledDate || getTodayString(),
        status: "active",
        createdAt: event.timestamp,
        sortOrder: event.payload.sortOrder ?? event.timestamp,
      });
    } else if (event.type === "ACTION_UPDATED") {
        const existing = actionsMap.get(event.id);
        if (existing) {
          actionsMap.set(event.id, { ...existing, ...event.payload });
        }
    } else if (event.type === "ACTION_COMPLETED") {
      const existing = actionsMap.get(event.id);
      if (existing) {
        existing.status = "completed";
      }
    } else if (event.type === "ACTION_ABANDONED") {
      const existing = actionsMap.get(event.id);
      if (existing) {
        existing.status = "abandoned";
      }
    }
  }

  return Array.from(actionsMap.values()).sort((a, b) => b.sortOrder - a.sortOrder);
}

export async function addAction(payload: ActionPayload) {
  const id = uuidv7();
  const event: Event<ActionPayload> = {
    id,
    type: "ACTION_INTENDED",
    timestamp: Date.now(),
    payload: {
      ...payload,
      scheduledDate: payload.scheduledDate || getTodayString(),
      sortOrder: payload.sortOrder ?? Date.now(),
    },
  };

  await db.query("INSERT INTO events (id, type, timestamp, payload) VALUES ($1, $2, $3, $4)", [
    event.id,
    event.type,
    event.timestamp,
    JSON.stringify(event.payload),
  ]);
  return id;
}

export async function updateAction(id: string, payload: Partial<ActionPayload>) {
  const event: Event<Partial<ActionPayload>> = {
    id,
    type: "ACTION_UPDATED",
    timestamp: Date.now(),
    payload,
  };

  await db.query("INSERT INTO events (id, type, timestamp, payload) VALUES ($1, $2, $3, $4)", [
    event.id,
    event.type,
    event.timestamp,
    JSON.stringify(event.payload),
  ]);
}

export async function completeAction(id: string) {
  const event = {
    id,
    type: "ACTION_COMPLETED",
    timestamp: Date.now(),
    payload: {},
  };

  await db.query("INSERT INTO events (id, type, timestamp, payload) VALUES ($1, $2, $3, $4)", [
    event.id,
    event.type,
    event.timestamp,
    JSON.stringify(event.payload),
  ]);
}

export async function abandonAction(id: string) {
  const event = {
    id,
    type: "ACTION_ABANDONED",
    timestamp: Date.now(),
    payload: {},
  };

  await db.query("INSERT INTO events (id, type, timestamp, payload) VALUES ($1, $2, $3, $4)", [
    event.id,
    event.type,
    event.timestamp,
    JSON.stringify(event.payload),
  ]);
}
