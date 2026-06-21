import { activeAdapter } from "./index";
import * as core from "@kreozalabs/core";
import type { Action, ActionPayload, ActionStatus } from "@kreozalabs/core";

export const addAction = (payload: ActionPayload) =>
  core.addAction(payload, activeAdapter.getDeviceId(), activeAdapter);

export const updateAction = (id: string, payload: Partial<ActionPayload>) =>
  core.updateAction(id, payload, activeAdapter.getDeviceId(), activeAdapter);

export const completeAction = (id: string) =>
  core.completeAction(id, activeAdapter.getDeviceId(), activeAdapter);

export const activateAction = (id: string) =>
  core.activateAction(id, activeAdapter.getDeviceId(), activeAdapter);

export const abandonAction = (id: string) =>
  core.abandonAction(id, activeAdapter.getDeviceId(), activeAdapter);

export const deleteActionPermanently = (id: string) =>
  core.deleteActionPermanently(id, activeAdapter.getDeviceId(), activeAdapter);

export const restoreAction = (action: Action) =>
  core.restoreAction(action, activeAdapter.getDeviceId(), activeAdapter);

export const bulkCompleteActions = (ids: string[]) =>
  core.bulkCompleteActions(ids, activeAdapter.getDeviceId(), activeAdapter);

export const bulkActivateActions = (ids: string[]) =>
  core.bulkActivateActions(ids, activeAdapter.getDeviceId(), activeAdapter);

export const bulkAbandonActions = (ids: string[]) =>
  core.bulkAbandonActions(ids, activeAdapter.getDeviceId(), activeAdapter);

export const bulkUpdateActions = (ids: string[], payload: Partial<ActionPayload>) =>
  core.bulkUpdateActions(ids, payload, activeAdapter.getDeviceId(), activeAdapter);

export const bulkStatusUpdateActions = (updates: { id: string; status: ActionStatus }[]) =>
  core.bulkStatusUpdateActions(updates, activeAdapter.getDeviceId(), activeAdapter);

export const bulkUpdateMultipleActions = (
  updates: { id: string; payload: Partial<ActionPayload> }[]
) => core.bulkUpdateMultipleActions(updates, activeAdapter.getDeviceId(), activeAdapter);

export const getActions = (filters?: Parameters<typeof core.getActions>[1]) =>
  core.getActions(activeAdapter, filters);

export const rebuildActions = () => core.rebuildActions(activeAdapter);

export const getEventsForEntity = (entityId: string) =>
  core.getEventsForEntity(entityId, activeAdapter);
