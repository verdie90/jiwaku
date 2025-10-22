"use client";

import React from "react";
import { User } from "@/types";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/app.store";
import { Menu, Bell, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

interface HeaderProps {
  user: User;
}

export function Header({ user }: HeaderProps) {
  const { sidebarOpen, setSidebarOpen } = useAppStore();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden"
        >
          <Menu className="w-5 h-5" />
        </Button>

        <h1 className="text-lg font-semibold text-foreground">
          Welcome back, {user.name.split(" ")[0]}!
        </h1>
      </div>

      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </Button>

        {/* Theme Toggle */}
        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="hidden sm:inline-flex"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </Button>
        )}

        {/* User Avatar */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-medium cursor-pointer">
          {user.name.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}
