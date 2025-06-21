import { useState } from "react";
import {
  Home,
  Layers,
  Library,
  Edit3,
  User,
  Settings,
  HelpCircle,
  Bolt,
  ChevronLeft,
  ChevronRight,
  Dot,
  LucideIcon,
  Target,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

// Type definitions
interface SubItem {
  name: string;
  path: string;
}

interface NavItem {
  name: string;
  icon: LucideIcon;
  path: string;
  color?: string;
  notifications?: number;
  isPriority?: boolean;
  dotIndicator?: boolean;
  highlight?: boolean;
  subItems?: SubItem[];
}

interface NavGroup {
  section: string;
  items: NavItem[];
}

const navigationItems: NavGroup[] = [
  {
    section: "ACADEMIC",
    items: [
      { name: "Dashboard", icon: Home, path: "/dashboard" },
      {
        name: "My Courses",
        icon: Layers,
        path: "/dashboard/courses",
        
      },
      {
        name: "Study Library",
        icon: Library,
        path: "/dashboard/library",
        notifications: 8,
      },
      
    ],
  },
  {
    section: "COMMUNITY",
    items: [
      {
        name: "Notes Feed",
        icon: Edit3,
        path: "/dashboard/note-feed",
        notifications: 12,
      },
      {
        name: "Opportunites Hub",
        icon: Target,
        path: "/dashboard/opportunities",
        highlight: true,
      },
    ],
  },
  {
    section: "GAME MODE",
    items: [
      {
        name: "Focused Mode",
        icon: Bolt,
        path: "/dashboard/focused-mode",
        notifications: 3,
        isPriority: true,
        color: "text-red-600",
      },
    ],
  },
  {
    section: "SYSTEM",
    items: [
      { name: "Profile", icon: User, path: "/dashboard/profile" },
      { name: "Settings", icon: Settings, path: "/dashboard/settings" },
      { name: "Help", icon: HelpCircle, path: "/" },
    ],
  },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [expanded, setExpanded] = useState<boolean>(true);
  const location = useLocation();
  const navigate = useNavigate();
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});

  const toggleSidebar = () => {
    setExpanded(!expanded);
  };

  const toggleSubmenu = (path: string) => {
    setOpenSubmenus((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div
        className={`${
          expanded ? "w-64" : "md:w-20 w-0"
        } h-full flex flex-col transition-all duration-300 ease-in-out fixed border-r shadow-md bg-white z-10 ${
          !expanded ? "overflow-hidden" : ""
        }`}
      >
        {/* Navigation content - hidden on mobile when collapsed */}
        <div
          className={`flex-1 py-4 overflow-y-auto ${!expanded ? "md:block hidden" : ""}`}
        >
          {navigationItems.map((group) => (
            <div key={group.section} className="mb-6 last:mb-2">
              {expanded && (
                <h3 className="px-4 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {group.section}
                </h3>
              )}

              <ul className="space-y-1 px-3">
                {group.items.map((item) => (
                  <li key={item.name}>
                    <div className="relative">
                      <button
                        onClick={() => {
                          if (item.subItems) {
                            toggleSubmenu(item.path);
                          }
                          handleNavigation(item.path);
                        }}
                        className={`flex items-center w-full rounded-lg p-3 transition-all ${
                          location.pathname.startsWith(item.path)
                            ? "bg-indigo-50 text-indigo-600"
                            : "text-gray-700 hover:bg-gray-100"
                        } ${item.color || ""} ${
                          item.highlight ? "ring-1 ring-indigo-300" : ""
                        }`}
                      >
                        <div className="relative">
                          <item.icon
                            size={20}
                            className={
                              location.pathname.startsWith(item.path)
                                ? "text-indigo-600"
                                : ""
                            }
                          />
                          {!expanded && item.notifications && (
                            <Dot
                              size={24}
                              className="absolute -top-2 -right-2 text-red-500 fill-current"
                            />
                          )}
                        </div>

                        {expanded && (
                          <div className="ml-3 flex justify-between items-center w-full">
                            <span className="text-sm font-medium">
                              {item.name}
                            </span>
                            {item.notifications && (
                              <span className="bg-indigo-600 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                                {item.notifications}
                              </span>
                            )}
                            {item.dotIndicator && (
                              <span className="h-2 w-2 bg-green-500 rounded-full"></span>
                            )}
                          </div>
                        )}
                      </button>

                      {expanded && item.subItems && openSubmenus[item.path] && (
                        <ul className="ml-10 mt-1 space-y-1">
                          {item.subItems.map((subItem) => (
                            <li key={subItem.name}>
                              <button
                                onClick={() => handleNavigation(subItem.path)}
                                className={`flex items-center w-full rounded-lg px-3 py-2 text-xs transition-all ${
                                  location.pathname === subItem.path
                                    ? "bg-indigo-100 text-indigo-600"
                                    : "text-gray-600 hover:bg-gray-50"
                                }`}
                              >
                                {subItem.name}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Toggle button - positioned relative to viewport */}
        <div
          className={`fixed top-15 z-20 transition-all duration-300 ${
            expanded ? "left-[245px]" : "md:left-[65px] left-3"
          }`}
        >
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-full bg-white border shadow-sm hover:bg-gray-50 transition-colors"
            aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            {expanded ? (
              <ChevronLeft className="h-4 w-4 text-gray-600" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div
        className={`flex-1 flex flex-col ${
          expanded ? "md:ml-64 ml-64" : "md:ml-20 ml-0"
        } transition-all duration-300 py-6 pl-0`}
      >
        {children}
      </div>
    </div>
  );
}
