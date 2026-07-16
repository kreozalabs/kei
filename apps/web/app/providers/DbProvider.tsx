import * as React from "react";
import { useEffect, useState } from "react";
import { initPromise } from "../db";
import { DbContext } from "./DbContext";

export function DbProvider({ children }: { children: React.ReactNode }) {
  const [isDbReady, setIsDbReady] = useState(false);
  const [dbError, setDbError] = useState<Error | null>(null);
  const [isWriting, setIsWriting] = useState(false);

  useEffect(() => {
    initPromise
      .then(() => setIsDbReady(true))
      .catch((err) => {
        console.error("Critical: DB Initialization failed", err);
        setDbError(err instanceof Error ? err : new Error(String(err)));
      });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateIsWriting = () => {
      setIsWriting(((window as Window & { __activeWrites?: number }).__activeWrites || 0) > 0);
    };

    updateIsWriting();

    window.addEventListener("kei_active_writes_change", updateIsWriting);
    return () => {
      window.removeEventListener("kei_active_writes_change", updateIsWriting);
    };
  }, []);

  const value = React.useMemo(
    () => ({ isDbReady, dbError, isWriting }),
    [isDbReady, dbError, isWriting]
  );

  return <DbContext value={value}>{children}</DbContext>;
}
