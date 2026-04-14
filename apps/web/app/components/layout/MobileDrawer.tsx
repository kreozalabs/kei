import { NavLink } from "react-router";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  Button,
} from "@kreozalabs/ui";
import { navGroups } from "@/config/navigation";
import { SettingsIcon, LogOutIcon } from "lucide-react";
import { cn } from "@kreozalabs/ui";

interface MobileDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileDrawer({ open, onOpenChange }: MobileDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[85vw] sm:w-100 flex flex-col p-6 overflow-y-auto border-l-0 shadow-2xl"
      >
        <SheetHeader className="mb-6">
          <SheetTitle className="text-2xl font-bold tracking-tight text-left">Browse</SheetTitle>
          <SheetDescription className="text-left">
            Navigate your entire setup and archives.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col space-y-8 flex-1">
          {navGroups.map((group) => (
            <div key={group.label} className="flex flex-col space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60 px-2">
                {group.label}
              </h4>
              <div className="flex flex-col space-y-1">
                {group.items.map((item) => (
                  <NavLink
                    key={item.id}
                    to={item.href}
                    onClick={() => onOpenChange(false)}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 font-medium",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-foreground/80 hover:bg-muted/80 active:bg-muted"
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon
                          className={cn("size-5", isActive && "text-primary fill-primary/20")}
                        />
                        <span className="text-[15px]">{item.label}</span>
                        {item.count !== undefined && (
                          <span
                            className={cn(
                              "ml-auto text-xs font-bold tabular-nums bg-background/50 px-2 rounded-full",
                              isActive ? "text-primary/70" : "text-muted-foreground/60"
                            )}
                          >
                            {item.count}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}

          {/* Quick Settings Group */}
          <div className="flex flex-col space-y-2 mt-auto pt-8 border-t">
            <NavLink
              to="/app/settings"
              onClick={() => onOpenChange(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 font-medium",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-foreground/80 hover:bg-muted/80 active:bg-muted"
                )
              }
            >
              <SettingsIcon className="size-5" />
              <span className="text-[15px]">Settings</span>
            </NavLink>
            <Button
              variant="ghost"
              onClick={() => console.log("Log out")}
              className="flex w-full justify-start items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 font-medium text-destructive/80 hover:text-destructive hover:bg-destructive/10 active:bg-destructive/20 h-auto"
            >
              <LogOutIcon className="size-5" />
              <span className="text-[15px]">Log out</span>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
