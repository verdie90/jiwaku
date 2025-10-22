"use client";

import React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { User } from "@/types";
import { cn } from "@/lib/utils/helpers";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/app.store";
import {
  MessageSquare,
  Phone,
  Ticket,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  Users,
} from "lucide-react";

const MENU_ITEMS = [
  {
    icon: Home,
    label: "Dashboard",
    href: "/dashboard",
    roles: ["super_admin", "admin", "team_lead", "agent", "viewer"],
  },
  {
    icon: MessageSquare,
    label: "Messages",
    href: "/dashboard/messages",
    roles: ["super_admin", "admin", "team_lead", "agent"],
  },
  {
    icon: Phone,
    label: "Calls",
    href: "/dashboard/calls",
    roles: ["super_admin", "admin", "team_lead", "agent"],
  },
  {
    icon: Ticket,
    label: "Tickets",
    href: "/dashboard/tickets",
    roles: ["super_admin", "admin", "team_lead", "agent", "viewer"],
  },
  {
    icon: Users,
    label: "Contacts",
    href: "/dashboard/contacts",
    roles: ["super_admin", "admin", "team_lead", "agent"],
  },
  {
    icon: BarChart3,
    label: "Analytics",
    href: "/dashboard/analytics",
    roles: ["super_admin", "admin", "team_lead", "viewer"],
  },
  {
    icon: Settings,
    label: "Settings",
    href: "/dashboard/settings",
    roles: ["super_admin", "admin"],
  },
];

interface SidebarProps {
  user: User;
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { sidebarOpen, setSidebarOpen } = useAppStore();
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  const filteredMenuItems = MENU_ITEMS.filter((item) =>
    item.roles.includes(user.role)
  );

  const handleLogout = async () => {
    try {
      const { authService } = await import("@/services/auth.service");
      await authService.logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (isMobile && !sidebarOpen) {
    return null;
  }

  return (
    <>
      {/* Overlay for mobile */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed md:sticky top-0 left-0 h-screen w-64 bg-card border-r border-border transition-transform duration-300 z-50",
          isMobile && !sidebarOpen && "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-border">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold">
                J
              </div>
              <span className="font-bold text-lg">Jiwaku</span>
            </Link>
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-secondary"
                  )}
                  onClick={() => isMobile && setSidebarOpen(false)}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="border-t border-border p-4 space-y-3">
            <div className="px-4 py-2">
              <p className="text-xs text-muted-foreground">Logged in as</p>
              <p className="font-medium text-sm truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {user.email}
              </p>
            </div>

            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full"
              size="sm"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile menu toggle */}
      {isMobile && !sidebarOpen && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed bottom-6 right-6 z-40 rounded-full shadow-lg"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="w-5 h-5" />
        </Button>
      )}
    </>
  );
}
