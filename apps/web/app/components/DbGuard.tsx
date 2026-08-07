import * as React from "react";
import { useDb } from "@/providers/DbContext";
import { Button } from "@kreozalabs/kei-ui";
import { RefreshCw, AlertTriangle } from "lucide-react";

interface DbGuardProps {
  children: React.ReactNode;
  errorFallback?: React.ReactNode;
}

export function DbGuard({ children, errorFallback }: DbGuardProps) {
  const { dbError, retryInit } = useDb();
  const [isRetrying, setIsRetrying] = React.useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await retryInit();
    } finally {
      setIsRetrying(false);
    }
  };

  if (dbError) {
    if (errorFallback) {
      return <>{errorFallback}</>;
    }

    return (
      <div className="bg-background text-foreground animate-in fade-in flex min-h-screen w-full flex-col items-center justify-center p-6 text-center select-none">
        <div className="bg-destructive/10 mb-6 flex size-16 items-center justify-center rounded-2xl">
          <AlertTriangle className="text-destructive size-8" />
        </div>
        <h2 className="text-2xl font-semibold tracking-tight">Database Connection Failed</h2>
        <p className="text-muted-foreground mt-2 max-w-md text-sm leading-relaxed">
          {dbError.message || "Could not initialize local database storage."}
        </p>
        <div className="mt-8 flex items-center gap-3">
          <Button
            size="lg"
            onClick={handleRetry}
            disabled={isRetrying}
            className="flex items-center gap-2 rounded-xl"
          >
            <RefreshCw className={`size-4 ${isRetrying ? "animate-spin" : ""}`} />
            <span>{isRetrying ? "Retrying..." : "Retry Connection"}</span>
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
