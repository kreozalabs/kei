import React, { useState } from "react";
import {
  InboxIcon,
  CalendarDaysIcon,
  CalendarIcon,
  MenuIcon,
  PlusIcon,
  SearchIcon,
  MoreVerticalIcon,
} from "lucide-react";
import { Button, cn } from "@kreozalabs/ui";
import { Logo as KreozaLogo } from "@kreozalabs/icons";

interface AppLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  onFabClick?: () => void;
}

export function AppLayout({ children, title, subtitle, onFabClick }: AppLayoutProps) {
  const [activeTab, setActiveTab] = useState("today");

  const navItems = [
    { id: "inbox", label: "Inbox", icon: InboxIcon, count: 5 },
    { id: "today", label: "Today", icon: CalendarDaysIcon, count: 6 },
    { id: "upcoming", label: "Upcoming", icon: CalendarIcon },
    { id: "browse", label: "Browse", icon: MenuIcon },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      {/* Desktop Sidebar (Placeholder) */}
      <aside className="hidden md:flex w-64 border-r flex-col p-4 space-y-2 shrink-0">
        <div className="flex items-center gap-3 px-2 py-4 mb-4">
          <div className="flex items-center justify-center bg-primary/5 p-2 rounded-xl">
            <KreozaLogo className="size-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight leading-none">Kei</span>
            <span className="text-[9px] font-mono text-muted-foreground/60 uppercase tracking-[0.2em] leading-tight mt-0.5">
              &nbsp; by Kreoza
            </span>
          </div>
        </div>

        {navItems.map((item) => (
          <Button
            key={item.id}
            variant={activeTab === item.id ? "secondary" : "ghost"}
            rounded="md"
            className={cn(
              "w-full flex flex-row items-center justify-between px-3 py-2 h-11 font-medium transition-all border-none",
              activeTab === item.id
                ? "bg-primary/10 text-primary shadow-none"
                : "text-muted-foreground hover:bg-muted"
            )}
            onClick={() => setActiveTab(item.id)}
          >
            <div className="flex items-center gap-3">
              <item.icon className="size-5" />
              <span className="tracking-tight">{item.label}</span>
            </div>
            {item.count !== undefined && (
              <span
                className={cn(
                  "text-[11px] font-bold tabular-nums",
                  activeTab === item.id ? "text-primary/70" : "text-muted-foreground/40"
                )}
              >
                {item.count}
              </span>
            )}
          </Button>
        ))}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* Mobile Header */}
        <header className="sticky top-0 z-40 w-full border-b md:border-none backdrop-blur-xl bg-background/80 md:bg-transparent">
          <div className="container mx-auto h-16 md:h-20 flex items-center justify-between px-4 sm:px-8">
            <div className="flex flex-col">
              <h1 className="text-xl md:text-3xl font-extrabold tracking-tight">{title}</h1>
              {subtitle && (
                <span className="text-xs md:text-sm text-muted-foreground font-medium">
                  {subtitle}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 md:gap-4">
              <Button variant="ghost" size="icon" rounded="xl" className="border-none">
                <SearchIcon className="size-5 text-muted-foreground" />
              </Button>
              <Button variant="ghost" size="icon" rounded="xl" className="border-none">
                <MoreVerticalIcon className="size-5 text-muted-foreground" />
              </Button>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 pb-24 md:pb-8">
          <div className="container mx-auto px-4 sm:px-8">{children}</div>
        </div>

        {/* Mobile FAB */}
        <Button
          onClick={onFabClick}
          className="md:hidden fixed bottom-24 right-6 size-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/20 flex items-center justify-center transition-all active:scale-95 z-50 group border-none"
          aria-label="Add Action"
        >
          <PlusIcon className="size-8 group-hover:rotate-90 transition-transform duration-300" />
        </Button>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-card/80 backdrop-blur-2xl border-t z-50 flex items-center justify-around px-2 pb-safe">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <Button
                key={item.id}
                variant="ghost"
                rounded="xl"
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 min-w-16 h-16 transition-all",
                  isActive ? "text-primary bg-primary/5" : "text-muted-foreground/60"
                )}
              >
                <div
                  className={cn("p-1.5 rounded-full transition-all", isActive && "bg-primary/10")}
                >
                  <item.icon className={cn("size-6", isActive && "fill-primary/20")} />
                </div>
                <span className="text-[10px] font-bold tracking-tight uppercase">{item.label}</span>
              </Button>
            );
          })}
        </nav>
      </main>
    </div>
  );
}
