import { getOrCreateDeviceIdentity as getDeviceId } from "@/utils/device";
import { activeAdapter } from "./index";
import * as core from "@kreozalabs/core";
import type { Action, ActionPayload, ActionStatus } from "@kreozalabs/core";

export const addAction = (payload: ActionPayload) =>
  core.addAction(payload, getDeviceId(), activeAdapter);

export const updateAction = (id: string, payload: Partial<ActionPayload>) =>
  core.updateAction(id, payload, getDeviceId(), activeAdapter);

export const completeAction = (id: string) => core.completeAction(id, getDeviceId(), activeAdapter);

export const activateAction = (id: string) => core.activateAction(id, getDeviceId(), activeAdapter);

export const abandonAction = (id: string) => core.abandonAction(id, getDeviceId(), activeAdapter);

export const deleteActionPermanently = (id: string) =>
  core.deleteActionPermanently(id, getDeviceId(), activeAdapter);

export const restoreAction = (action: Action) =>
  core.restoreAction(action, getDeviceId(), activeAdapter);

export const bulkCompleteActions = (ids: string[]) =>
  core.bulkCompleteActions(ids, getDeviceId(), activeAdapter);

export const bulkActivateActions = (ids: string[]) =>
  core.bulkActivateActions(ids, getDeviceId(), activeAdapter);

export const bulkAbandonActions = (ids: string[]) =>
  core.bulkAbandonActions(ids, getDeviceId(), activeAdapter);

export const bulkUpdateActions = (ids: string[], payload: Partial<ActionPayload>) =>
  core.bulkUpdateActions(ids, payload, getDeviceId(), activeAdapter);

export const bulkStatusUpdateActions = (updates: { id: string; status: ActionStatus }[]) =>
  core.bulkStatusUpdateActions(updates, getDeviceId(), activeAdapter);

export const bulkUpdateMultipleActions = (
  updates: { id: string; payload: Partial<ActionPayload> }[]
) => core.bulkUpdateMultipleActions(updates, getDeviceId(), activeAdapter);

export const getActions = (filters?: Parameters<typeof core.getActions>[1]) =>
  core.getActions(activeAdapter, filters);

export const rebuildActions = () => core.rebuildActions(activeAdapter);

export const getEventsForEntity = (entityId: string) =>
  core.getEventsForEntity(entityId, activeAdapter);
