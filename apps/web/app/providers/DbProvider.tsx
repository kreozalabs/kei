import * as React from "react";
import { useEffect, useState, useCallback } from "react";
import {
  initPromise,
  retryDatabaseInit,
  subscribeActiveWrites,
  subscribeInitProgress,
  type DbInitStep,
} from "../db";
import { DbContext } from "./DbContext";
import { DbGuard } from "../components/DbGuard";

interface DbProviderProps {
  children: React.ReactNode;
  showGuard?: boolean;
}

export function DbProvider({ children, showGuard = true }: DbProviderProps) {
  const [isDbReady, setIsDbReady] = useState(false);
  const [dbError, setDbError] = useState<Error | null>(null);
  const [isWriting, setIsWriting] = useState(false);
  const [initStep, setInitStep] = useState<DbInitStep>("idle");
  const [progress, setProgress] = useState(0);

  /**
   * Subscribes to the initial database initialization promise.
   * On resolution, marks `isDbReady` as true. On error, populates `dbError`.
   */
  const init = useCallback(() => {
    setDbError(null);
    initPromise
      .then(() => setIsDbReady(true))
      .catch((err) => {
        console.error("Critical: DB Initialization failed", err);
        setDbError(err instanceof Error ? err : new Error(String(err)));
      });
  }, []);

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    const unsubscribeProgress = subscribeInitProgress((state) => {
      setInitStep(state.step);
      setProgress(state.progress);
      if (state.error) {
        setDbError(state.error);
      }
    });
    const unsubscribeWrites = subscribeActiveWrites(setIsWriting);

    return () => {
      unsubscribeProgress();
      unsubscribeWrites();
    };
  }, []);

  /**
   * Resets readiness state and re-executes database initialization.
   * Invoked by DbGuard retry button when initial database startup encounters an error.
   */
  const retryInit = useCallback(async () => {
    setDbError(null);
    setIsDbReady(false);
    try {
      await retryDatabaseInit();
      setIsDbReady(true);
    } catch (err) {
      console.error("Critical: DB Retry Initialization failed", err);
      setDbError(err instanceof Error ? err : new Error(String(err)));
    }
  }, []);

  const value = React.useMemo(
    () => ({ isDbReady, dbError, isWriting, initStep, progress, retryInit }),
    [isDbReady, dbError, isWriting, initStep, progress, retryInit]
  );

  return (
    <DbContext value={value}>{showGuard ? <DbGuard>{children}</DbGuard> : children}</DbContext>
  );
}
