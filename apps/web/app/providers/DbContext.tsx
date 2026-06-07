import { createContext, useContext } from "react";

export interface DbContextState {
  isDbReady: boolean;
  dbError: Error | null;
  isWriting: boolean;
}

export const DbContext = createContext<DbContextState>({
  isDbReady: false,
  dbError: null,
  isWriting: false,
});

export const useDb = () => {
  const context = useContext(DbContext);
  if (context === undefined) {
    throw new Error("useDb must be used within a DbProvider");
  }
  return context;
};
