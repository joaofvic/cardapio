
"use client";

import { Home, Menu, ShoppingCart, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  cartCount: number;
}

export function BottomNav({ activeTab, onTabChange, cartCount }: BottomNavProps) {
  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'menu', icon: Menu, label: 'Menu' },
    { id: 'search', icon: Search, label: 'Search' },
    { id: 'cart', icon: ShoppingCart, label: 'Cart', badge: cartCount },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border px-6 py-3 flex justify-between items-center shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="relative flex flex-col items-center gap-1 group"
          >
            <div className={cn(
              "p-2 rounded-xl transition-all duration-300",
              isActive ? "bg-primary text-white" : "text-muted-foreground group-hover:bg-muted"
            )}>
              <Icon size={24} className={cn(
                "transition-transform duration-300",
                isActive && "scale-110"
              )} />
            </div>
            <span className={cn(
              "text-[10px] font-medium transition-colors duration-300",
              isActive ? "text-primary" : "text-muted-foreground"
            )}>
              {tab.label}
            </span>
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className="absolute -top-1 -right-1 bg-secondary text-secondary-foreground text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-white">
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
