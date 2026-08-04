import { useEffect, useState } from "react";
import { Logo } from "@kreozalabs/logos";
import { Label, Progress } from "@kreozalabs/kei-ui";
import { useDb } from "@/providers/DbContext";

interface AppLoadingProps {
  progress?: number;
  minLoadingMs?: number;
  onComplete?: () => void;
}

export const AppLoading = ({
  progress: customProgress,
  minLoadingMs = 750,
  onComplete,
}: AppLoadingProps) => {
  const dbContext = useDb();

  // Use DB context values unless customProgress override is passed
  const targetProgress =
    customProgress !== undefined ? customProgress : dbContext ? dbContext.progress : 0;

  const [smoothProgress, setSmoothProgress] = useState(0);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  // Track the minimum loading time from mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, minLoadingMs);

    return () => clearTimeout(timer);
  }, [minLoadingMs]);

  const [prevTargetProgress, setPrevTargetProgress] = useState(targetProgress);

  if (targetProgress !== prevTargetProgress) {
    setPrevTargetProgress(targetProgress);
    if (targetProgress < 100) {
      setSmoothProgress(targetProgress);
    }
  }

  useEffect(() => {
    let active = true;
    const interval = setInterval(() => {
      if (!active) return;
      setSmoothProgress((prev) => {
        if (prev >= targetProgress) {
          if (targetProgress >= 100) return 100;
          return prev;
        }
        // Increment smoothly towards targetProgress
        const stepSize = Math.max(0.5, (targetProgress - prev) * 0.1);
        return Math.min(targetProgress, prev + stepSize);
      });
    }, 16); // ~60fps

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [targetProgress]);

  // Safely trigger onComplete side effect once visual loading is completely finished
  useEffect(() => {
    if (smoothProgress >= 100 && minTimeElapsed) {
      onComplete?.();
    }
  }, [smoothProgress, minTimeElapsed, onComplete]);

  return (
    <div className="bg-background text-foreground animate-in fade-in flex min-h-screen w-full flex-col items-center justify-center p-8 text-center select-none">
      <div className="flex flex-col items-center gap-12">
        {/* Brand Logo with Glow */}
        <div className="relative flex items-center justify-center">
          <div className="bg-primary/30 absolute -inset-10 animate-pulse rounded-full opacity-40 blur-3xl" />
          <Logo className="text-primary relative size-36 drop-shadow-[0_0_30px_rgba(var(--primary),0.35)] transition-transform duration-500 hover:scale-105" />
        </div>

        {/* Progress & Status Container */}
        <div className="flex flex-col items-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <Label className="text-3xl font-black tracking-widest uppercase">Kreoza Kei</Label>
          </div>

          <div className="relative w-96">
            <Progress
              value={smoothProgress}
              className="h-2.5 w-96 transition-all duration-500 ease-out"
            />
            {/* Subtle glow underneath the progress bar */}
            <div
              className="bg-primary absolute top-0 h-2.5 opacity-60 blur-[3px] transition-all duration-500 ease-out"
              style={{ width: `${smoothProgress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
