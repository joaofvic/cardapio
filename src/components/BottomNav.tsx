
"use client";

import { UtensilsCrossed, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  cartCount: number;
}

export function BottomNav({ activeTab, onTabChange, cartCount }: BottomNavProps) {
  const tabs = [
    { id: 'menu', icon: UtensilsCrossed, label: 'Cardápio' },
    { id: 'cart', icon: ShoppingCart, label: 'Cesta', badge: cartCount },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-t border-border px-6 py-3 flex justify-around items-center shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="relative flex flex-col items-center gap-1 group outline-none"
          >
            <div className={cn(
              "p-2.5 rounded-2xl transition-all duration-500 ease-spring",
              isActive 
                ? "bg-primary text-white scale-110 shadow-xl shadow-primary/30" 
                : "text-muted-foreground group-hover:bg-muted group-active:scale-90"
            )}>
              <Icon size={22} className={cn(
                "transition-transform duration-500",
                isActive ? "animate-in zoom-in-90 duration-300" : "scale-100"
              )} />
            </div>
            <span className={cn(
              "text-[10px] font-black transition-all duration-300 uppercase tracking-tighter",
              isActive ? "text-primary opacity-100 translate-y-0" : "text-muted-foreground opacity-70"
            )}>
              {tab.label}
            </span>
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className="absolute -top-1 -right-1 bg-secondary text-secondary-foreground text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center border-2 border-white animate-in zoom-in duration-300 shadow-sm">
                {tab.badge}
              </span>
            )}
            
            {/* Active Indicator Dot */}
            {isActive && (
              <span className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full animate-in fade-in zoom-in duration-500" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
