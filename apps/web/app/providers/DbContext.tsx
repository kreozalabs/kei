import { createContext, use } from "react";
import type { DbInitStep } from "../db";

export interface DbContextState {
  isDbReady: boolean;
  dbError: Error | null;
  isWriting: boolean;
  initStep: DbInitStep;
  progress: number;
  retryInit: () => Promise<void>;
}

export const DbContext = createContext<DbContextState>({
  isDbReady: false,
  dbError: null,
  isWriting: false,
  initStep: "idle",
  progress: 0,
  retryInit: async () => {},
});

export const useDb = () => {
  const context = use(DbContext);
  if (context === undefined) {
    throw new Error("useDb must be used within a DbProvider");
  }
  return context;
};
