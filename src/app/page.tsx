
"use client";

import { useState, useMemo } from "react";
import { Search, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function HarvestBitesApp() {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('home');
  const [browsingHistory, setBrowsingHistory] = useState<string[]>([]);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { toast } = useToast();

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
      // Scroll to top when changing tab
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleProfileClick = () => {
    toast({
      title: "Perfil do Usuário",
      description: "Funcionalidade de perfil em breve!",
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pt-6 pb-24">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-primary font-black text-2xl tracking-tighter">HARVEST BITES</h2>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Refeições Saudáveis & Prontas
          </p>
        </div>
        <div className="flex gap-3">
          <button className="p-3 bg-white rounded-2xl shadow-sm text-foreground hover:bg-muted transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-3 right-3 w-2 h-2 bg-secondary rounded-full border-2 border-white" />
          </button>
          <button 
            onClick={handleProfileClick}
            className="rounded-2xl border border-primary/20 overflow-hidden hover:opacity-80 transition-all hover:scale-105 active:scale-95"
          >
            <Avatar className="w-10 h-10 rounded-2xl border-none">
              <AvatarImage src="https://picsum.photos/seed/user123/100/100" alt="Perfil do Cliente" />
              <AvatarFallback className="bg-primary/10 text-primary font-bold rounded-2xl text-xs">HB</AvatarFallback>
            </Avatar>
          </button>
        </div>
      </header>

      {/* Animated Page Content Wrapper */}
      <div key={activeTab} className="animate-in fade-in slide-in-from-bottom-3 duration-500 fill-mode-both ease-out">
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
          {activeTab === 'home' && (
            <RecommendationSection 
              browsingHistory={browsingHistory} 
              onAddToCart={handleAddToCart}
              onOpenDetails={handleOpenDetails}
            />
          )}
        </main>
      </div>

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
