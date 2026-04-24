
"use client";

import * as React from "react";
import { useState, useMemo, useEffect } from "react";
import { Search, MapPin, User, Utensils, Sparkles, ChevronLeft, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { MEALS } from "@/app/data/meals";
import { Meal, CartItem } from "@/app/types/meal";
import { MealCard } from "@/components/MealCard";
import { BottomNav } from "@/components/BottomNav";
import { MealDetailsDialog } from "@/components/MealDetailsDialog";
import { CartSheet } from "@/components/CartSheet";
import { IdentificationDialog } from "@/components/IdentificationDialog";
import { CitySelectionDialog } from "@/components/CitySelectionDialog";
import { ComboManualConfigurator } from "@/components/ComboManualConfigurator";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

export type UserProfile = {
  name: string;
  phone: string;
  address?: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    complement?: string;
    reference?: string;
  };
};

type ViewMode = 'menu' | 'combo-type' | 'combo-manual' | 'combo-ai';

export default function HarvestBitesApp() {
  const [viewMode, setViewMode] = useState<ViewMode>('menu');
  const [activeCategory, setActiveCategory] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('menu');
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCityDialogOpen, setIsCityDialogOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [selectedCity, setSelectedCity] = useState<string>('São Miguel - RN');
  
  const { toast } = useToast();

  useEffect(() => {
    const savedUser = localStorage.getItem('harvest_bites_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    const savedCity = localStorage.getItem('harvest_bites_city');
    if (savedCity) {
      setSelectedCity(savedCity);
    } else {
      setIsCityDialogOpen(true);
    }
  }, []);

  const categories = [
    { id: 'Todos', label: 'Todos' },
    { id: 'Combos', label: 'Combo Semanal' },
    { id: 'Frango', label: 'Frango' },
    { id: 'Carne', label: 'Carne' },
    { id: 'Peixe', label: 'Peixe' },
    { id: 'Legumes', label: 'Legumes' }
  ];

  const filteredMeals = useMemo(() => {
    return MEALS.filter(meal => {
      const categoryMap: Record<string, string> = {
        'Todos': 'All',
        'Combos': 'Combo',
        'Frango': 'Chicken',
        'Carne': 'Beef',
        'Peixe': 'Fish',
        'Legumes': 'Veggie'
      };
      const activeId = categoryMap[activeCategory] || 'All';
      const matchesCategory = activeId === 'All' || meal.category === activeId;
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
  };

  const handleTabChange = (tabId: string) => {
    if (tabId === 'cart') {
      setIsCartOpen(true);
    } else {
      setActiveTab(tabId);
      setViewMode('menu');
      setActiveCategory('Todos');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleIdentifyUser = (profile: UserProfile) => {
    setUser(profile);
    localStorage.setItem('harvest_bites_user', JSON.stringify(profile));
    setIsProfileOpen(false);
  };

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    localStorage.setItem('harvest_bites_city', city);
    setIsCityDialogOpen(false);
  };

  const userFirstName = user?.name ? user.name.split(' ')[0] : null;

  return (
    <div className="max-w-4xl mx-auto px-4 pt-6 pb-24">
      <CitySelectionDialog 
        isOpen={isCityDialogOpen} 
        onOpenChange={setIsCityDialogOpen}
        onCitySelect={handleCitySelect} 
      />
      
      <header className="flex justify-between items-start mb-8">
        <div className="animate-in fade-in slide-in-from-left duration-[3000ms] ease-in-out">
          <h1 className="text-primary font-black text-2xl tracking-tighter leading-none">HARVEST BITES</h1>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
            Refeições Saudáveis & Prontas
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button 
            onClick={() => setIsProfileOpen(true)}
            className="bg-white p-2.5 min-w-[44px] rounded-2xl shadow-sm text-primary hover:bg-muted transition-all active:scale-95 flex items-center gap-2 border border-border/50 animate-in fade-in slide-in-from-right duration-[3000ms] ease-in-out"
          >
            {userFirstName ? (
              <div className="flex items-center gap-2 px-1">
                <span className="text-xs font-bold text-foreground truncate max-w-[80px]">Olá, {userFirstName}</span>
                <div className="bg-primary/10 p-1 rounded-lg">
                  <User size={16} />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-1">
                <span className="text-xs font-bold text-foreground">Perfil</span>
                <User size={18} />
              </div>
            )}
          </button>

          <button 
            key={selectedCity}
            onClick={() => setIsCityDialogOpen(true)}
            className="bg-white px-3 py-2 rounded-2xl shadow-sm text-primary hover:bg-muted transition-all active:scale-95 flex items-center gap-2 border border-border/50 animate-in fade-in zoom-in duration-[3000ms] ease-in-out"
          >
            <MapPin size={14} className="text-primary" />
            <div className="text-right">
              <p className="text-[9px] font-black uppercase text-muted-foreground leading-none mb-0.5">Entregar em</p>
              <p className="text-xs font-bold text-foreground leading-none truncate max-w-[120px]">
                {selectedCity}
              </p>
            </div>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="animate-in fade-in slide-in-from-bottom-3 duration-[3000ms] fill-mode-both ease-out">
        
        {/* Navigation & Search (Conditional) */}
        {viewMode === 'menu' && (
          <div className="sticky top-4 z-30 bg-background/80 backdrop-blur-md pb-4 pt-2">
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <Input 
                className="pl-12 h-14 rounded-2xl bg-white border-none shadow-sm text-lg focus-visible:ring-primary focus-visible:ring-offset-0 focus-visible:ring-inset"
                placeholder="Buscar pratos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    if (cat.id === 'Combos') {
                      setViewMode('combo-type');
                    } else {
                      setActiveCategory(cat.id);
                    }
                  }}
                  className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 whitespace-nowrap ${
                    activeCategory === cat.id 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                    : 'bg-white text-muted-foreground hover:bg-muted shadow-sm'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <main className="mt-6 min-h-[60vh]">
          {viewMode === 'menu' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-[3000ms]">
              {filteredMeals.map((meal) => (
                <MealCard 
                  key={meal.id} 
                  meal={meal} 
                  onAddToCart={handleAddToCart}
                  onOpenDetails={handleOpenDetails}
                />
              ))}
            </div>
          )}

          {viewMode === 'combo-type' && (
            <div className="space-y-6 py-8 animate-in slide-in-from-right duration-[3000ms] ease-in-out">
              <button 
                onClick={() => setViewMode('menu')}
                className="flex items-center gap-2 text-primary font-black uppercase text-xs mb-6 hover:translate-x-[-4px] transition-transform"
              >
                <ArrowLeft size={16} /> Voltar ao Cardápio
              </button>
              
              <div className="text-center mb-10">
                <h2 className="text-3xl font-black tracking-tighter text-foreground">Escolha seu Estilo</h2>
                <p className="text-muted-foreground font-medium mt-2">Como você prefere montar seu kit de 5 refeições?</p>
              </div>

              <div className="grid grid-cols-1 gap-4 max-w-lg mx-auto">
                <button
                  onClick={() => setViewMode('combo-manual')}
                  className="w-full flex items-center justify-between p-8 rounded-[2.5rem] bg-white shadow-sm hover:shadow-xl hover:bg-primary/5 hover:text-primary transition-all group border-2 border-transparent hover:border-primary/20 text-left"
                >
                  <div className="flex items-center gap-6">
                    <div className="bg-primary/10 p-4 rounded-2xl group-hover:bg-primary group-hover:text-white transition-colors">
                      <Utensils size={32} />
                    </div>
                    <div>
                      <h4 className="font-black text-foreground group-hover:text-primary uppercase text-sm tracking-widest">Montar Manualmente</h4>
                      <p className="text-xs font-medium text-muted-foreground mt-1">Eu escolho cada um dos 5 pratos (3 itens por prato)</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    toast({
                      title: "Plano Alimentar AI",
                      description: "Esta funcionalidade estará disponível em breve!",
                    });
                  }}
                  className="w-full flex items-center justify-between p-8 rounded-[2.5rem] bg-primary/5 hover:bg-primary/10 transition-all group border-2 border-primary/10 hover:border-primary/30 text-left"
                >
                  <div className="flex items-center gap-6">
                    <div className="bg-secondary p-4 rounded-2xl shadow-sm text-secondary-foreground group-hover:scale-110 transition-transform">
                      <Sparkles size={32} />
                    </div>
                    <div>
                      <h4 className="font-black text-primary uppercase text-sm tracking-widest flex items-center gap-2">
                        Plano Alimentar AI
                        <span className="bg-primary text-white text-[10px] px-3 py-1 rounded-full font-black">NOVO</span>
                      </h4>
                      <p className="text-xs font-medium text-muted-foreground mt-1">Sugestão baseada nos seus objetivos de saúde</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {viewMode === 'combo-manual' && (
            <div className="animate-in slide-in-from-right duration-[3000ms] ease-in-out">
               <button 
                onClick={() => setViewMode('combo-type')}
                className="flex items-center gap-2 text-primary font-black uppercase text-xs mb-6 hover:translate-x-[-4px] transition-transform"
              >
                <ArrowLeft size={16} /> Voltar
              </button>
              <ComboManualConfigurator 
                onAddToCart={(combo) => {
                  handleAddToCart(combo);
                  setViewMode('menu');
                  setActiveCategory('Todos');
                }}
              />
            </div>
          )}
        </main>
      </div>

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
        user={user}
        selectedCity={selectedCity}
        onIdentify={handleIdentifyUser}
        onUpdateQuantity={handleUpdateQuantity}
        onRemove={handleRemoveItem}
      />

      <IdentificationDialog 
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onIdentify={handleIdentifyUser}
        initialUser={user || undefined}
      />

      <BottomNav 
        activeTab={activeTab} 
        onTabChange={handleTabChange} 
        cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
      />

      <Toaster />
    </div>
  );
}
