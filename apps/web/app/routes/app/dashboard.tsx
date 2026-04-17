import { useEffect, useState } from "react";
import { useOutletContext } from "react-router";
import type { AppLayoutContext } from "@/components/layout/AppLayout";
import { HeaderSearch } from "@/components/layout/AppHeader";
import { initDb } from "@/db";
import { Alert, AlertTitle, Button } from "@kreozalabs/ui";
import { DatabaseIcon, LockIcon, UnlockIcon } from "lucide-react";
import type { Action } from "@/types/events";
import { ActionSection } from "@/components/ActionSection";

// --- Mock Data ---
const mockOverdueActions: Action[] = [
  {
    id: "mock-1",
    title: "Draft Q2 marketing strategy",
    description: "Include budget breakdown and key campaign metrics",
    project: "Marketing",
    priority: "high",
    energy: "high",
    status: "active",
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: "mock-2",
    title: "Review PR #142 for dashboard UI",
    description: "Check for mobile responsiveness on smaller breakpoints",
    project: "Engineering",
    priority: "medium",
    energy: "medium",
    status: "active",
    createdAt: Date.now() - 86400000,
  },
];

const mockTodayActions: Action[] = [
  {
    id: "mock-3",
    title: "Weekly team sync",
    description: "Prepare talking points about Q2 okrs",
    project: "Management",
    priority: "low",
    energy: "low",
    status: "active",
    createdAt: Date.now(),
  },
  {
    id: "mock-4",
    title: "Fix responsive issue on landing page",
    description: "Hero image scaling on mobile is broken on Android",
    project: "Engineering",
    priority: "high",
    energy: "medium",
    status: "active",
    createdAt: Date.now(),
  },
  {
    id: "mock-5",
    title: "Order coffee beans",
    project: "Personal",
    priority: "low",
    energy: "low",
    status: "active",
    createdAt: Date.now(),
  },
  {
    id: "mock-6",
    title: "Update documentation for API v2",
    description: "Add new endpoint examples for the /sync route",
    project: "Engineering",
    priority: "medium",
    energy: "high",
    status: "active",
    createdAt: Date.now(),
  },
];

export default function Dashboard() {
  const [isDbReady, setIsDbReady] = useState(false);

  const [isTodayLocked, setIsTodayLocked] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = window.sessionStorage.getItem("kei-dashboard-timeline-locked");
      if (stored !== null) return stored === "true";
    }
    return true; // Default to locked
  });

  useEffect(() => {
    window.sessionStorage.setItem("kei-dashboard-timeline-locked", String(isTodayLocked));
  }, [isTodayLocked]);

  const { setTitle, setSubtitle, setHeaderActions } = useOutletContext<AppLayoutContext>();

  useEffect(() => {
    initDb().then(() => setIsDbReady(true));
  }, []);

  useEffect(() => {
    setTitle("Today");
    setSubtitle(
      new Date().toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    );

    setHeaderActions({
      center: <HeaderSearch />,
      right: (
        <div className="md:hidden flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsTodayLocked((prev) => !prev)}
            className="size-8 border-none rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all active:scale-95"
            title={isTodayLocked ? "Unlock Timeline" : "Lock to Today"}
          >
            {isTodayLocked ? <LockIcon className="size-4" /> : <UnlockIcon className="size-4" />}
          </Button>
        </div>
      ),
    });

    return () => setHeaderActions(undefined);
  }, [setTitle, setSubtitle, setHeaderActions, isTodayLocked]);

  return (
    <>
      <div className="max-w-3xl mx-auto px-2 sm:px-0 mt-4 sm:mt-6">
        {!isTodayLocked && <ActionSection id="overdue" sectionTitle="Overdue" actions={mockOverdueActions} />}

        {/* Today Section */}
        <ActionSection
          id="today"
          sectionTitle={
            new Date().toLocaleDateString("en-US", { day: "numeric", month: "short" }) + " ‧ Today"
          }
          actions={mockTodayActions}
          isTodayLocked={isTodayLocked}
        />

        {/* TODO: Later Section */}
        {/* {!isTodayLocked && <ActionSection sectionTitle="Later" actions={mockLaterActions} />} */}

        {/* Mobile bottom padding for FAB */}
        <div className="h-24 md:h-8" />
      </div>

      {/* Status Alert */}
      {!isDbReady && (
        <div className="fixed bottom-24 right-8 z-50 md:bottom-8">
          <Alert
            variant="default"
            className="shadow-2xl border-primary/20 bg-background/80 backdrop-blur-md animate-pulse min-w-75 rounded-2xl"
          >
            <DatabaseIcon className="size-4 text-primary" />
            <AlertTitle className="text-xs font-bold uppercase tracking-wider">
              Initializing Local PGlite...
            </AlertTitle>
          </Alert>
        </div>
      )}
    </>
  );
}
