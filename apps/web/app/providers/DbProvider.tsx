import * as React from "react";
import {
  initPromise,
  retryDatabaseInit,
  subscribeActiveWrites,
  subscribeInitProgress,
  type DbInitStep,
} from "../db";
import { DbContext } from "./DbContext";
import { DbGuard } from "../components/DbGuard";
import { AppLoading } from "../components/AppLoader";

interface DbProviderProps {
  children: React.ReactNode;
  showGuard?: boolean;
}

export function DbProvider({ children, showGuard = true }: DbProviderProps) {
  const [isDbReady, setIsDbReady] = React.useState(false);
  const [dbError, setDbError] = React.useState<Error | null>(null);
  const [isWriting, setIsWriting] = React.useState(false);
  const [initStep, setInitStep] = React.useState<DbInitStep>("idle");
  const [progress, setProgress] = React.useState(0);
  const [isHealing, setIsHealing] = React.useState(false);

  const [loaderComplete, setLoaderComplete] = React.useState(false);

  // Reset loader complete status when database readiness is reset (during retries)
  const retryInit = React.useCallback(async () => {
    setDbError(null);
    setIsDbReady(false);
    setLoaderComplete(false);
    try {
      await retryDatabaseInit();
      setIsDbReady(true);
    } catch (err) {
      console.error("Critical: DB Retry Initialization failed", err);
      setDbError(err instanceof Error ? err : new Error(String(err)));
    }
  }, []);

  /**
   * Subscribes to the initial database initialization promise.
   * On resolution, marks `isDbReady` as true. On error, populates `dbError`.
   */
  React.useEffect(() => {
    let isMounted = true;
    initPromise
      .then(() => {
        if (isMounted) setIsDbReady(true);
      })
      .catch((err) => {
        console.error("Critical: DB Initialization failed", err);
        if (isMounted) {
          setDbError(err instanceof Error ? err : new Error(String(err)));
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  React.useEffect(() => {
    const unsubscribeProgress = subscribeInitProgress((state) => {
      setInitStep(state.step);
      setProgress(state.progress);
      setIsHealing(!!state.isHealing);
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

  const value = React.useMemo(
    () => ({ isDbReady, dbError, isWriting, initStep, progress, isHealing, retryInit }),
    [isDbReady, dbError, isWriting, initStep, progress, isHealing, retryInit]
  );

  const isReady = isDbReady && loaderComplete;

  return (
    <DbContext value={value}>
      {isReady ? (
        showGuard ? <DbGuard>{children}</DbGuard> : children
      ) : (
        <AppLoading
          progress={isDbReady ? 100 : undefined}
          onComplete={() => setLoaderComplete(true)}
        />
      )}
    </DbContext>
  );
}
