import React, { useState } from "react";
import {
  InboxIcon,
  CalendarDaysIcon,
  CalendarIcon,
  MenuIcon,
  PlusIcon,
  SearchIcon,
  MoreVerticalIcon,
  BellIcon,
  PanelLeftIcon,
  MessageSquareIcon,
  PersonStandingIcon,
  HandshakeIcon,
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
    { id: "inbox", label: "Inbox", icon: InboxIcon, count: 5, visible: true, mobileVisible: true },
    {
      id: "today",
      label: "Today",
      icon: CalendarDaysIcon,
      count: 6,
      visible: true,
      mobileVisible: true,
    },
    { id: "upcoming", label: "Upcoming", icon: CalendarIcon, visible: true, mobileVisible: true },
    { id: "me", label: "Me", icon: PersonStandingIcon, visible: true, mobileVisible: false },
    { id: "promises", label: "Promises", icon: HandshakeIcon, visible: true, mobileVisible: false },
    { id: "browse", label: "Browse", icon: MenuIcon, visible: true, mobileVisible: true },
  ];

  return (
    <div className="flex flex-col md:flex-row h-dvh w-full overflow-hidden bg-background md:bg-muted/10 text-foreground">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 flex-col p-4 space-y-2 shrink-0 overflow-y-auto">
        {/* App & Profile Header */}
        <div className="flex items-center justify-between mb-6 px-0">
          <Button
            variant="ghost"
            className="hidden md:flex items-center gap-2.5 px-0 py-1.5 h-auto border-none font-medium hover:bg-muted/50 justify-start flex-1 min-w-0 rounded-lg group"
          >
            <div className="flex items-center justify-center bg-primary/10 text-primary size-8 rounded-lg shrink-0 group-hover:bg-primary/20 transition-colors">
              <KreozaLogo className="size-5" />
            </div>
            <div className="flex flex-col items-start min-w-0">
              <span className="font-bold text-[13px] tracking-tight leading-none text-foreground/90">
                Kei
              </span>
              <span className="text-[10.5px] font-medium text-muted-foreground/70 truncate mt-1">
                {"{user.email} or login"}
              </span>
            </div>
          </Button>
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex items-center gap-1.5 h-8 rounded-md hover:bg-muted/50 border-none font-medium size-8 hover:text-foreground text-muted-foreground/60"
            >
              <BellIcon className="size-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex items-center gap-1.5 h-8 rounded-md hover:bg-muted/50 border-none font-medium size-8 hover:text-foreground text-muted-foreground/60"
            >
              <PanelLeftIcon className="size-5" />
            </Button>
          </div>
        </div>

        {/* Add Action Button */}
        <div className="mb-4">
          <Button
            variant="ghost"
            className="flex flex-row items-center transition-all hover:scale-[1.02] active:scale-[0.98] w-full justify-start text-primary hover:text-primary hover:bg-primary/5 gap-2.5 h-9 rounded-lg px-2"
          >
            <PlusIcon className="size-5 sm:size-6" />
            <span className="font-semibold text-sm sm:inline">Add Action</span>
          </Button>
        </div>

        {navItems.map((item) => (
          <Button
            key={item.id}
            variant={activeTab === item.id ? "secondary" : "ghost"}
            rounded="lg"
            className={cn(
              "w-full flex items-center justify-between px-2.5 py-1.5 h-9 font-medium transition-none border-none mb-2",
              activeTab === item.id
                ? "bg-primary/10 text-primary shadow-none"
                : "text-muted-foreground hover:bg-muted/60"
            )}
            onClick={() => setActiveTab(item.id)}
          >
            <div className="flex items-center gap-2.5">
              <item.icon className={cn("size-4.5", activeTab === item.id && "text-primary")} />
              <span className="tracking-tight text-sm">{item.label}</span>
            </div>
            {item.count !== undefined && (
              <span
                className={cn(
                  "text-[11px] font-bold tabular-nums",
                  activeTab === item.id ? "text-primary/70" : "text-muted-foreground/50"
                )}
              >
                {item.count}
              </span>
            )}
          </Button>
        ))}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 relative overflow-hidden bg-background">
        {/* Header - Transparent on Desktop with Actions, Full on Mobile */}
        <header className="shrink-0 z-40 w-full h-14 md:h-12 flex items-center justify-between px-4 md:py-10 py-8 sm:px-8 md:px-6 sticky top-0 bg-background/95 backdrop-blur-xl border-b md:border-none">
          {/* Mobile Title */}
          <div className="flex flex-col md:hidden">
            <h1 className="text-xl font-bold tracking-tight">{title}</h1>
            {subtitle && (
              <span className="text-xs text-muted-foreground font-medium">{subtitle}</span>
            )}
          </div>
          <div className="hidden md:block" /> {/* Spacer for flex-between */}
          <div className="flex items-center gap-1 md:gap-3 text-muted-foreground">
            {/* Top Right Actions */}
            <div className="px-20">
              {/* TODO: On 1 second hover open search modal */}
              <Button
                variant="ghost"
                size="sm"
                className="hidden md:flex items-center gap-2 h-8 rounded-md hover:bg-muted/50 border-none font-medium"
                onTouchMoveCapture={() => console.log("hello")}
              >
                <SearchIcon className="size-4" /> Ctrl+K
              </Button>
            </div>

            <Button
              variant="default"
              size="sm"
              onClick={onFabClick}
              className="hidden md:flex items-center gap-1.5 h-8 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-3 shadow-sm border-none transition-all active:scale-95"
            >
              <PlusIcon className="size-4" /> New Action
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="hidden md:flex items-center gap-1.5 h-8 rounded-md hover:bg-muted/50 border-none font-medium"
            >
              <PanelLeftIcon className="size-4" /> Display
            </Button>
            <div className="hidden md:flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="size-8 rounded-md hover:bg-muted/50 border-none"
              >
                <MessageSquareIcon className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 rounded-md hover:bg-muted/50 border-none"
              >
                <MoreVerticalIcon className="size-4" />
              </Button>
            </div>

            {/* Mobile Actions */}
            <div className="flex md:hidden items-center gap-2">
              <Button variant="ghost" size="icon" className="size-8 border-none">
                <SearchIcon className="size-4" />
              </Button>
              <Button variant="ghost" size="icon" className="size-8 border-none">
                <MoreVerticalIcon className="size-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pb-24 md:pb-12">
          <div className="container mx-auto max-w-200 px-4 sm:px-8 md:px-12 pt-4 md:pt-10">
            {/* Desktop Full Title (Todoist Style) */}
            <div className="hidden md:flex md:flex-col mb-8">
              <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            </div>

            {children}
          </div>
        </div>

        {/* Floating Action Button (Mobile only) */}
        <Button
          onClick={onFabClick}
          className="md:hidden fixed bottom-24 right-6 size-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xl shadow-primary/30 flex items-center justify-center transition-all active:scale-95 z-50 group border-none"
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
                  "flex flex-col items-center justify-center gap-1 min-w-16 h-16 transition-all border-none",
                  isActive ? "text-primary bg-primary/2" : "text-muted-foreground/80"
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
