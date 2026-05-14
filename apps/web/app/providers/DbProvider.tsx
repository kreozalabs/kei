import * as React from "react";
import { useEffect, useState } from "react";
import { initPromise } from "../db";
import { DbContext } from "./DbContext";

export function DbProvider({ children }: { children: React.ReactNode }) {
  const [isDbReady, setIsDbReady] = useState(false);
  const [dbError, setDbError] = useState<Error | null>(null);

  useEffect(() => {
    initPromise
      .then(() => setIsDbReady(true))
      .catch((err) => {
        console.error("Critical: DB Initialization failed", err);
        setDbError(err instanceof Error ? err : new Error(String(err)));
      });
  }, []);

  const value = React.useMemo(() => ({ isDbReady, dbError }), [isDbReady, dbError]);

  return <DbContext.Provider value={value}>{children}</DbContext.Provider>;
}
