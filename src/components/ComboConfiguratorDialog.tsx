
"use client";

import { useState, useMemo } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { MEALS } from "@/app/data/meals";
import { Meal } from "@/app/types/meal";
import { Plus, Minus, CheckCircle2, Utensils, ArrowRight } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ComboConfiguratorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (combo: Meal) => void;
}

const COMBO_SIZE = 5;
const COMBO_PRICE = 159.90;

export function ComboConfiguratorDialog({ isOpen, onClose, onAddToCart }: ComboConfiguratorDialogProps) {
  const [selectedItems, setSelectedItems] = useState<Meal[]>([]);
  const [activeTab, setActiveTab] = useState<'All' | 'Chicken' | 'Beef' | 'Fish' | 'Veggie'>('All');

  const filteredMeals = useMemo(() => {
    const pool = MEALS.filter(m => m.category !== 'Combo');
    if (activeTab === 'All') return pool;
    return pool.filter(m => m.category === activeTab);
  }, [activeTab]);

  const handleAddItem = (meal: Meal) => {
    if (selectedItems.length < COMBO_SIZE) {
      setSelectedItems(prev => [...prev, meal]);
    }
  };

  const handleRemoveItem = (index: number) => {
    setSelectedItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleConfirm = () => {
    if (selectedItems.length === COMBO_SIZE) {
      const comboDescription = `Kit personalizado com: ${selectedItems.map(m => m.name).join(", ")}`;
      const comboMeal: Meal = {
        id: `custom-combo-${Date.now()}`,
        name: "Combo Personalizado (5 Refeições)",
        category: "Combo",
        description: comboDescription,
        price: COMBO_PRICE,
        protein: selectedItems.reduce((acc, m) => acc + m.protein, 0),
        carbs: selectedItems.reduce((acc, m) => acc + m.carbs, 0),
        calories: selectedItems.reduce((acc, m) => acc + m.calories, 0),
        imageUrl: MEALS.find(m => m.category === 'Combo')?.imageUrl || '',
        rating: 5.0
      };
      onAddToCart(comboMeal);
      setSelectedItems([]);
      onClose();
    }
  };

  const categories = [
    { id: 'All', label: 'Todos' },
    { id: 'Chicken', label: 'Frango' },
    { id: 'Beef', label: 'Carne' },
    { id: 'Fish', label: 'Peixe' },
    { id: 'Veggie', label: 'Legumes' }
  ];

  const currentSlot = selectedItems.length < COMBO_SIZE ? selectedItems.length + 1 : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] h-[95vh] flex flex-col p-0 overflow-hidden border-none rounded-[3rem] bg-white shadow-2xl animate-in zoom-in duration-[3000ms] ease-in-out">
        {/* Header Section */}
        <div className="bg-primary p-8 text-white shrink-0 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                <Utensils className="text-white" size={24} />
              </div>
              <DialogTitle className="text-3xl font-black tracking-tighter">Monte seu Combo</DialogTitle>
            </div>
            <DialogDescription className="text-white/80 font-medium">
              Personalize cada uma das suas 5 marmitas semanais.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 space-y-4">
            {/* Visual Slots Indicator */}
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {Array.from({ length: COMBO_SIZE }).map((_, i) => {
                const item = selectedItems[i];
                const isActive = selectedItems.length === i;
                return (
                  <div 
                    key={i} 
                    className={cn(
                      "flex flex-col items-center min-w-[120px] p-3 rounded-2xl border-2 transition-all duration-500",
                      item 
                        ? "bg-white text-primary border-white" 
                        : (isActive ? "border-white bg-white/20 scale-105" : "border-white/30 bg-white/5 opacity-50")
                    )}
                  >
                    <span className={cn("text-[9px] font-black uppercase tracking-tighter mb-1", item ? "text-primary" : "text-white")}>
                      Marmita {i + 1}
                    </span>
                    {item ? (
                      <div className="flex flex-col items-center text-center animate-in zoom-in duration-500">
                        <CheckCircle2 size={16} className="text-primary mb-1" />
                        <span className="text-[10px] font-black uppercase leading-tight">CONCLUÍDA</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center opacity-70">
                        {isActive ? (
                          <span className="text-[10px] font-bold">ESCOLHENDO...</span>
                        ) : (
                          <span className="text-[10px] font-bold">AGUARDANDO</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-end mb-1">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Progresso do Kit</span>
                <span className="text-sm font-black">{selectedItems.length} / {COMBO_SIZE}</span>
              </div>
              <Progress value={(selectedItems.length / COMBO_SIZE) * 100} className="h-2.5 bg-white/20" />
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex flex-col flex-grow overflow-hidden bg-muted/20">
          <div className="px-6 py-4 bg-white border-b overflow-x-auto no-scrollbar flex items-center justify-between shrink-0">
            <div className="flex gap-2">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id as any)}
                  className={cn(
                    "px-4 py-2 rounded-full text-xs font-black uppercase transition-all whitespace-nowrap",
                    activeTab === cat.id ? "bg-primary text-white shadow-md" : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            {currentSlot && (
              <div className="bg-primary/10 text-primary px-4 py-2 rounded-full flex items-center gap-2 animate-pulse">
                <span className="text-[10px] font-black uppercase">Escolhendo Marmita {currentSlot}</span>
                <ArrowRight size={14} />
              </div>
            )}
          </div>

          <div className="flex flex-grow overflow-hidden">
            <ScrollArea className="flex-grow">
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMeals.map((meal) => (
                  <div 
                    key={meal.id}
                    className="bg-white p-4 rounded-[2rem] shadow-sm border border-border/40 flex flex-col group hover:border-primary/30 transition-all duration-500 hover:shadow-xl"
                  >
                    <div className="relative h-32 w-full rounded-2xl overflow-hidden mb-4">
                      <Image src={meal.imageUrl} alt={meal.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-[9px] font-black text-primary">
                        {meal.calories} kcal
                      </div>
                    </div>
                    
                    <div className="flex flex-col flex-grow">
                      <h4 className="font-black text-sm leading-tight mb-2">{meal.name}</h4>
                      <p className="text-[10px] text-muted-foreground line-clamp-2 mb-4 leading-relaxed">{meal.description}</p>
                      
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex gap-2 text-[9px] font-bold text-muted-foreground">
                          <span>{meal.protein}g P</span>
                          <span>{meal.carbs}g C</span>
                        </div>
                        <Button 
                          size="sm" 
                          className="h-9 px-4 rounded-xl bg-primary hover:bg-primary/90 text-white text-[10px] font-black uppercase transition-all active:scale-95"
                          onClick={() => handleAddItem(meal)}
                          disabled={selectedItems.length >= COMBO_SIZE}
                        >
                          Selecionar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Summary Sidebar (Desktop Only) */}
            <div className="w-72 bg-white border-l shrink-0 flex flex-col hidden md:flex">
              <div className="p-6 border-b bg-muted/30">
                <h4 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Resumo do Combo</h4>
              </div>
              <ScrollArea className="flex-grow">
                <div className="p-6 space-y-4">
                  {selectedItems.map((item, idx) => (
                    <div key={`${item.id}-${idx}`} className="flex items-center gap-3 p-3 bg-muted/30 rounded-2xl animate-in slide-in-from-right-4 duration-500 group relative">
                      <div className="relative h-10 w-10 rounded-xl overflow-hidden shrink-0">
                        <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="flex-grow">
                        <span className="text-[10px] font-black text-primary uppercase">Marmita {idx + 1}</span>
                        <h5 className="text-[10px] font-bold truncate leading-tight">{item.name}</h5>
                      </div>
                      <button 
                        onClick={() => handleRemoveItem(idx)} 
                        className="text-muted-foreground hover:text-destructive p-1 bg-white rounded-lg shadow-sm"
                      >
                        <Minus size={12} />
                      </button>
                    </div>
                  ))}
                  
                  {Array.from({ length: Math.max(0, COMBO_SIZE - selectedItems.length) }).map((_, i) => (
                    <div key={`empty-${i}`} className="border-2 border-dashed border-muted rounded-2xl p-4 flex flex-col items-center justify-center gap-2 opacity-50">
                      <div className="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center">
                        <Plus size={14} className="text-muted-foreground" />
                      </div>
                      <span className="text-[9px] font-black uppercase text-muted-foreground">Marmita {selectedItems.length + i + 1}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              
              <div className="p-6 border-t bg-white">
                <div className="flex justify-between items-end mb-4 px-1">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase text-muted-foreground">Valor do Combo</span>
                    <span className="text-2xl font-black text-primary leading-none mt-1">R$ 159,90</span>
                  </div>
                </div>
                <Button 
                  className="w-full h-14 rounded-full font-black uppercase text-xs tracking-tight shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95"
                  disabled={selectedItems.length < COMBO_SIZE}
                  onClick={handleConfirm}
                >
                  Adicionar à Cesta <CheckCircle2 size={16} className="ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile bottom footer */}
        <div className="md:hidden p-6 bg-white border-t shrink-0 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase text-muted-foreground">
                {selectedItems.length} de {COMBO_SIZE} Concluídas
              </span>
              <span className="text-xl font-black text-primary">R$ 159,90</span>
            </div>
            {selectedItems.length < COMBO_SIZE && (
              <span className="text-[10px] font-black text-primary animate-pulse uppercase">Selecione a Marmita {selectedItems.length + 1}</span>
            )}
          </div>
          <Button 
            className="w-full h-14 rounded-full font-black uppercase text-xs shadow-xl shadow-primary/20"
            disabled={selectedItems.length < COMBO_SIZE}
            onClick={handleConfirm}
          >
            Adicionar Combo à Cesta
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
