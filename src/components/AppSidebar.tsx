import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, ChevronRight, Star, PanelLeftClose, PanelLeft, Search } from "lucide-react";
import { menuGroups, type MenuGroup } from "@/config/menuConfig";
import { useFavorites } from "@/contexts/FavoritesContext";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const AppSidebar = ({ collapsed, onToggle }: AppSidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["dashboards"]);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((g) => g !== groupId)
        : [...prev, groupId]
    );
  };

  const favoriteItems = menuGroups
    .flatMap((g) => g.items)
    .filter((item) => isFavorite(item.id));

  const filteredGroups = searchQuery
    ? menuGroups
        .map((group) => ({
          ...group,
          items: group.items.filter((item) =>
            item.title.toLowerCase().includes(searchQuery.toLowerCase())
          ),
        }))
        .filter((group) => group.items.length > 0)
    : menuGroups;

  return (
    <aside
      className={cn(
        "h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 shrink-0",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">F</span>
            </div>
            <span className="font-semibold text-foreground text-sm">FinanceERP</span>
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-1.5 rounded-md hover:bg-sidebar-accent text-sidebar-foreground transition-colors"
        >
          {collapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      {/* Search */}
      {!collapsed && (
        <div className="px-3 py-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-sidebar-accent/50 border border-sidebar-border">
            <Search size={14} className="text-muted-foreground" />
            <input
              type="text"
              placeholder="Search modules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none flex-1"
            />
          </div>
        </div>
      )}

      {/* Favorites */}
      {!collapsed && favoriteItems.length > 0 && !searchQuery && (
        <div className="px-3 pb-2">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground px-3 mb-1.5 font-medium">
            Favorites
          </p>
          <div className="flex flex-wrap gap-1 px-1">
            {favoriteItems.map((item) => (
              <button
                key={item.id}
                onClick={() => item.url && navigate(item.url)}
                className={cn(
                  "text-[11px] px-2 py-1 rounded-md transition-colors",
                  location.pathname === item.url
                    ? "bg-primary/20 text-primary"
                    : "bg-sidebar-accent text-sidebar-foreground hover:bg-sidebar-accent/80"
                )}
              >
                {item.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Menu Groups */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin px-2 py-1">
        {filteredGroups.map((group) => (
          <SidebarGroup
            key={group.id}
            group={group}
            expanded={expandedGroups.includes(group.id) || !!searchQuery}
            onToggle={() => toggleGroup(group.id)}
            collapsed={collapsed}
            currentPath={location.pathname}
            onNavigate={navigate}
            toggleFavorite={toggleFavorite}
            isFavorite={isFavorite}
          />
        ))}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-3 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-primary text-xs font-semibold">SA</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">Super Admin</p>
              <p className="text-[10px] text-muted-foreground truncate">admin@financeerp.com</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

interface SidebarGroupProps {
  group: MenuGroup;
  expanded: boolean;
  onToggle: () => void;
  collapsed: boolean;
  currentPath: string;
  onNavigate: (url: string) => void;
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
}

const SidebarGroup = ({
  group,
  expanded,
  onToggle,
  collapsed,
  currentPath,
  onNavigate,
  toggleFavorite,
  isFavorite,
}: SidebarGroupProps) => {
  const Icon = group.icon;
  const hasActiveItem = group.items.some((item) => item.url === currentPath);

  return (
    <div className="mb-0.5">
      <button
        onClick={collapsed ? undefined : onToggle}
        className={cn(
          "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors",
          hasActiveItem
            ? "text-primary bg-primary/5"
            : "text-sidebar-foreground hover:bg-sidebar-accent"
        )}
        title={collapsed ? group.label : undefined}
      >
        <Icon size={16} className="shrink-0" />
        {!collapsed && (
          <>
            <span className="flex-1 text-left">{group.label}</span>
            {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </>
        )}
      </button>
      {!collapsed && expanded && (
        <div className="ml-4 mt-0.5 space-y-px border-l border-sidebar-border pl-3">
          {group.items.map((item) => (
            <div key={item.id} className="flex items-center group">
              <button
                onClick={() => item.url && onNavigate(item.url)}
                className={cn(
                  "flex-1 text-left text-xs py-1.5 px-2 rounded-md transition-colors truncate",
                  currentPath === item.url
                    ? "text-primary bg-primary/10 font-medium"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                {item.title}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(item.id);
                }}
                className={cn(
                  "p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity",
                  isFavorite(item.id) && "opacity-100"
                )}
              >
                <Star
                  size={10}
                  className={cn(
                    isFavorite(item.id)
                      ? "fill-warning text-warning"
                      : "text-muted-foreground"
                  )}
                />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AppSidebar;
