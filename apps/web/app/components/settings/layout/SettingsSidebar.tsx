import { useMemo, useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { ChevronRight } from "lucide-react";
import { Button, cn } from "@kreozalabs/kei-ui";
import {
  SETTINGS_BASE_PATH,
  getSettingsPath,
  type SettingsTreeGroup,
  type SettingsTreeLeaf,
  SETTINGS_TREE_SECTIONS,
} from "../settingsSubPages";
import { useScrollSpy } from "@/hooks/useScrollSpy";

export type { SettingsTreeLeaf, SettingsTreeGroup };
export { SETTINGS_TREE_SECTIONS };

const GENERAL_SETTINGS_PATH = getSettingsPath("general");

interface SidebarLeafNodeProps {
  child: SettingsTreeLeaf;
  isActive: boolean;
  onNavigate: (item: SettingsTreeLeaf) => void;
}

function SidebarLeafNode({ child, isActive, onNavigate }: SidebarLeafNodeProps) {
  const itemRef = useRef<HTMLDivElement | null>(null);

  return (
    <div ref={isActive ? itemRef : null} role="treeitem" aria-selected={isActive}>
      <Button
        variant={isActive ? "secondary" : "ghost"}
        size="sm"
        onClick={() => onNavigate(child)}
        className={cn(
          "h-7 w-full justify-start rounded-md px-2.5 text-sm transition-colors",
          isActive
            ? "bg-accent text-accent-foreground font-semibold shadow-xs"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/60 font-normal"
        )}
      >
        <span className="truncate">{child.label}</span>
      </Button>
    </div>
  );
}

interface SidebarGroupNodeProps {
  group: SettingsTreeGroup;
  isExpanded: boolean;
  activeId: string;
  onToggle: (groupId: string) => void;
  onNavigate: (item: { id: string; href?: string; to?: string }) => void;
}

function SidebarGroupNode({
  group,
  isExpanded,
  activeId,
  onToggle,
  onNavigate,
}: SidebarGroupNodeProps) {
  const hasChildren = group.children && group.children.length > 0;

  return (
    <div role="treeitem" aria-expanded={hasChildren ? isExpanded : undefined}>
      {/* Group Header */}
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            onToggle(group.id);
            if (group.to) {
              onNavigate({ id: group.id, to: group.to });
            }
          }}
          className={cn(
            "hover:bg-accent/50 text-muted-foreground hover:text-foreground h-8 w-full justify-start gap-1.5 rounded-lg px-2 text-sm font-semibold transition-colors",
            !hasChildren && "pl-6"
          )}
        >
          {hasChildren && (
            <ChevronRight
              className={cn(
                "size-3.5 shrink-0 transition-transform duration-200",
                isExpanded && "rotate-90"
              )}
            />
          )}
          <span className="truncate">{group.label}</span>
        </Button>
      </div>

      {/* Child Links Group */}
      {hasChildren && isExpanded && (
        <div role="group" className="border-border/40 ml-3.5 space-y-0.5 border-l py-0.5 pl-2">
          {group.children!.map((child) => (
            <SidebarLeafNode
              key={child.id}
              child={child}
              isActive={activeId === child.id}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function SettingsSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  // Track expanded groups (default to all sections defined in tree config)
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() =>
    SETTINGS_TREE_SECTIONS.reduce(
      (acc, g) => {
        acc[g.id] = true;
        return acc;
      },
      {} as Record<string, boolean>
    )
  );

  const isSettingsPage = location.pathname.startsWith(SETTINGS_BASE_PATH);
  const isGeneralSettingsPage =
    location.pathname === SETTINGS_BASE_PATH || location.pathname === GENERAL_SETTINGS_PATH;

  // Extract in-page anchor section IDs for scroll spy
  const sectionIds = useMemo(() => {
    const ids: string[] = [];
    SETTINGS_TREE_SECTIONS.forEach((g) => {
      g.children?.forEach((c) => {
        if (c.href?.startsWith("#")) {
          ids.push(c.href.replace("#", ""));
        }
      });
    });
    return ids;
  }, []);

  // Decoupled scroll-spy hook for tracking section visibility on scroll across settings pages
  const spyActiveId = useScrollSpy(sectionIds, { enabled: isSettingsPage });

  // Sync scroll spy active section to browser URL hash so page reload preserves scroll position
  useEffect(() => {
    if (isSettingsPage && spyActiveId) {
      const targetHash = `#${spyActiveId}`;
      if (window.location.hash !== targetHash) {
        window.history.replaceState(
          null,
          "",
          `${window.location.pathname}${window.location.search}${targetHash}`
        );
      }
    }
  }, [isSettingsPage, spyActiveId]);

  // Derive active item ID during rendering (no useEffect setState)
  const activeId = useMemo(() => {
    // 1. Use scroll spy active section if available on any settings page
    if (spyActiveId) {
      return spyActiveId;
    }

    // 2. Hash match from location
    if (location.hash) {
      return location.hash.replace("#", "");
    }

    const pathname = location.pathname;

    // Check for direct child route matches
    for (const group of SETTINGS_TREE_SECTIONS) {
      const matchedChild = group.children?.find((child) => child.to === pathname);
      if (matchedChild) return matchedChild.id;
    }

    // Check for group route matches
    for (const group of SETTINGS_TREE_SECTIONS) {
      if (group.to === pathname) return group.id;
    }

    // Default fallback for main settings route
    if (isGeneralSettingsPage) {
      return "language-region";
    }

    return "";
  }, [location.hash, location.pathname, isGeneralSettingsPage, spyActiveId]);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const handleNavigate = (item: { id: string; href?: string; to?: string }) => {
    if (item.to) {
      navigate(item.to);
    } else if (item.href?.startsWith("#")) {
      const targetId = item.href.replace("#", "");
      const el = document.getElementById(targetId);
      if (el) {
        navigate(`${location.pathname}${item.href}`);
        el.scrollIntoView({ behavior: "smooth" });
      } else {
        const parentGroup = SETTINGS_TREE_SECTIONS.find((g) =>
          g.children?.some((c) => c.id === targetId)
        );
        const targetPath = parentGroup?.to ?? SETTINGS_BASE_PATH;
        navigate(`${targetPath}${item.href}`);
      }
    }
  };

  return (
    <div
      role="tree"
      aria-label="Settings Table of Contents"
      className="w-full space-y-1 py-1 pr-2 text-sm select-none"
    >
      <div className="text-muted-foreground px-3 pb-2 text-sm font-semibold">Table of Contents</div>

      {SETTINGS_TREE_SECTIONS.map((group) => (
        <SidebarGroupNode
          key={group.id}
          group={group}
          isExpanded={!!expandedGroups[group.id]}
          activeId={activeId}
          onToggle={toggleGroup}
          onNavigate={handleNavigate}
        />
      ))}
    </div>
  );
}
