import { useState } from "react";
import {
  Home,
  BarChart3,
  Users,
  Settings,
  Calendar,
  LogOut,
  ChevronRight,
  Layers,
  MessageSquare,
  HelpCircle,
  Menu,
  Bell,
} from "lucide-react";

// Define the navigation items
const navigationItems = [
  { name: "Dashboard", icon: Home, path: "/dashboard" },
  { name: "Analytics", icon: BarChart3, path: "/analytics" },
  { name: "Customers", icon: Users, path: "/customers" },
  { name: "Calendar", icon: Calendar, path: "/calendar" },
  { name: "Projects", icon: Layers, path: "/projects" },
  {
    name: "Messages",
    icon: MessageSquare,
    path: "/messages",
    notifications: 5,
  },
  { name: "Settings", icon: Settings, path: "/settings" },
  { name: "Help", icon: HelpCircle, path: "/help" },
];

export default function DashboardLayout({children}: any) {
  const [expanded, setExpanded] = useState(true);
  const [activePage, setActivePage] = useState("/dashboard");

  const toggleSidebar = () => {
    setExpanded(!expanded);
  };

  return (
    <div className="flex h-screen ">
      {/* Sidebar - fixed, non-scrollable */}
      <div
        className={`${
          expanded ? "w-96" : "w-20"
        } h-full  shadow-xl flex flex-col transition-all duration-300 ease-in-out overflow-hidden fixed`}
      >
       

        {/* Navigation Links - contained in a div with fixed height */}
        <div className="flex-1 px-3">
          <ul className="space-y-1">
            {navigationItems.map((item) => (
              <li key={item.name}>
                <button
                  onClick={() => setActivePage(item.path)}
                  className={`flex items-center w-full rounded-lg p-3 transition-all ${
                    activePage === item.path
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center justify-center w-6">
                    <item.icon
                      size={expanded ? 18 : 20}
                      className={
                        activePage === item.path
                          ? "text-indigo-600"
                          : "text-gray-500"
                      }
                    />
                  </div>

                  {expanded && (
                    <div className="ml-3 flex justify-between items-center w-full">
                      <span className="text-sm font-medium">{item.name}</span>
                      {item.notifications && (
                        <span className="bg-indigo-600 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                          {item.notifications}
                        </span>
                      )}
                    </div>
                  )}

                  {!expanded && item.notifications && (
                    <span className="absolute top-0 right-0 h-2 w-2 bg-indigo-600 rounded-full"></span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>

        
      </div>

      {/* Main Content Area - scrollable */}
      <div
        className={`flex-1 flex flex-col ${expanded ? "ml-4" : "ml-20"} transition-all duration-300`}
      >
        {children}
      </div>
    </div>
  );
}
