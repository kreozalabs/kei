import { useRef } from "react";
import { NavLink, useLocation } from "react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@kreozalabs/kei-ui";
import { navGroups } from "@/config/navigation";
import { SettingsIcon } from "lucide-react";
import { useSwipeGesture, GESTURE_EDGE_THRESHOLD } from "@/hooks/useSwipeGesture";

export function AppSidebar() {
  const { setOpenMobile, openMobile, isMobile } = useSidebar();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Mobile edge-swipe to open
  useSwipeGesture({
    onSwipeRight: () => setOpenMobile(true),
    edgeThreshold: GESTURE_EDGE_THRESHOLD,
    enabled: isMobile && !openMobile,
  });

  // Mobile swipe left to close
  useSwipeGesture({
    onSwipeLeft: () => setOpenMobile(false),
    enabled: isMobile && openMobile,
    // targetRef: sidebarRef,
  });

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const isPathActive = (href: string) => {
    return href === "/app"
      ? location.pathname === "/app"
      : location.pathname.startsWith(href);
  };

  return (
    <Sidebar ref={sidebarRef} collapsible="icon" className="md:top-16 md:h-[calc(100svh-4rem)]">
      <SidebarContent>
        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={isPathActive(item.href)}
                      tooltip={item.label}
                      className="data-[active=true]:bg-primary/10 data-[active=true]:text-primary data-[active=true]:font-semibold"
                    >
                      <NavLink to={item.href} onClick={handleLinkClick}>
                        <item.icon className="size-4 shrink-0" />
                        <span className="text-sm">{item.label}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="pb-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isPathActive("/app/settings")}
              tooltip="Settings"
              className="data-[active=true]:bg-primary/10 data-[active=true]:text-primary data-[active=true]:font-semibold"
            >
              <NavLink to="/app/settings" onClick={handleLinkClick}>
                <SettingsIcon className="size-4 shrink-0" />
                <span className="text-sm">Settings</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
