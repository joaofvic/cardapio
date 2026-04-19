
"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, Bell, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SpotlightSection } from "@/components/SpotlightSection";
import { MEALS } from "@/app/data/meals";
import { Meal, CartItem } from "@/app/types/meal";
import { MealCard } from "@/components/MealCard";
import { RecommendationSection } from "@/components/RecommendationSection";
import { BottomNav } from "@/components/BottomNav";
import { MealDetailsDialog } from "@/components/MealDetailsDialog";
import { CartSheet } from "@/components/CartSheet";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { CitySelectionDialog } from "@/components/CitySelectionDialog";

export default function HarvestBitesApp() {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('home');
  const [browsingHistory, setBrowsingHistory] = useState<string[]>([]);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [userCity, setUserCity] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const savedCity = localStorage.getItem("harvest_bites_city");
    if (savedCity) setUserCity(savedCity);
  }, []);

  const categories = ['All', 'Chicken', 'Beef', 'Veggie'];

  const filteredMeals = useMemo(() => {
    return MEALS.filter(meal => {
      const matchesCategory = activeCategory === 'All' || meal.category === activeCategory;
      const matchesSearch = meal.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           meal.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const handleAddToCart = (meal: Meal) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === meal.id);
      if (existing) {
        return prev.map(item => item.id === meal.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...meal, quantity: 1 }];
    });
    toast({
      title: "Adicionado à Cesta",
      description: `${meal.name} está pronto para checkout.`,
    });
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCartItems(prev => {
      return prev.map(item => {
        if (item.id === id) {
          const newQty = Math.max(0, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  const handleRemoveItem = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const handleOpenDetails = (meal: Meal) => {
    setSelectedMeal(meal);
    if (!browsingHistory.includes(meal.name)) {
      setBrowsingHistory(prev => [meal.name, ...prev].slice(0, 5));
    }
  };

  const handleTabChange = (tabId: string) => {
    if (tabId === 'cart') {
      setIsCartOpen(true);
    } else {
      setActiveTab(tabId);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pt-6 pb-24">
      {/* City Selection Logic */}
      <CitySelectionDialog onCitySelect={setUserCity} />

      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-primary font-black text-2xl tracking-tighter">HARVEST BITES</h2>
          <div className="flex items-center gap-1.5 group cursor-pointer" onClick={() => localStorage.removeItem("harvest_bites_city") || window.location.reload()}>
            <MapPin size={12} className="text-muted-foreground" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              {userCity || "Escolha sua cidade"}
            </span>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="p-3 bg-white rounded-2xl shadow-sm text-foreground hover:bg-muted transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-3 right-3 w-2 h-2 bg-secondary rounded-full border-2 border-white" />
          </button>
          <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
            <span className="font-bold text-primary">HB</span>
          </div>
        </div>
      </header>

      {/* Hero Spotlight */}
      {activeTab === 'home' && <SpotlightSection />}

      {/* Search and Filter */}
      <div className="sticky top-4 z-30 bg-background/80 backdrop-blur-md pb-4 pt-2">
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <Input 
            className="pl-12 h-14 rounded-2xl bg-white border-none shadow-sm text-lg focus-visible:ring-primary"
            placeholder="Buscar pratos ou ingredientes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Categories */}
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 whitespace-nowrap ${
                activeCategory === cat 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'bg-white text-muted-foreground hover:bg-muted shadow-sm'
              }`}
            >
              {cat === 'All' ? 'Todos' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="mt-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-foreground">
            {activeCategory === 'All' ? 'Cardápio Curado' : `Seleções: ${activeCategory}`}
          </h2>
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            {filteredMeals.length} ITENS
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMeals.map((meal) => (
            <MealCard 
              key={meal.id} 
              meal={meal} 
              onAddToCart={handleAddToCart}
              onOpenDetails={handleOpenDetails}
            />
          ))}
        </div>

        {/* AI Recommendations */}
        <RecommendationSection 
          browsingHistory={browsingHistory} 
          onAddToCart={handleAddToCart}
          onOpenDetails={handleOpenDetails}
        />
      </main>

      {/* Dialogs and Sheets */}
      <MealDetailsDialog 
        meal={selectedMeal}
        isOpen={!!selectedMeal}
        onClose={() => setSelectedMeal(null)}
        onAddToCart={handleAddToCart}
      />

      <CartSheet 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemove={handleRemoveItem}
      />

      {/* Bottom Nav */}
      <BottomNav 
        activeTab={activeTab} 
        onTabChange={handleTabChange} 
        cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
      />

      <Toaster />
    </div>
  );
}
