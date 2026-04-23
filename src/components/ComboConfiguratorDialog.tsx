
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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MEALS } from "@/app/data/meals";
import { Meal, CartItem } from "@/app/types/meal";
import { Plus, Minus, CheckCircle2, ShoppingBag, Utensils } from "lucide-react";
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] h-[90vh] flex flex-col p-0 overflow-hidden border-none rounded-[3rem] bg-white shadow-2xl animate-in zoom-in duration-[3000ms] ease-in-out">
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
              Escolha exatamente o que você quer em cada uma das suas 5 refeições.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 space-y-2">
            <div className="flex justify-between items-end mb-1">
              <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Progresso do Kit</span>
              <span className="text-sm font-black">{selectedItems.length} / {COMBO_SIZE}</span>
            </div>
            <Progress value={(selectedItems.length / COMBO_SIZE) * 100} className="h-3 bg-white/20" />
          </div>
        </div>

        <div className="flex flex-col flex-grow overflow-hidden bg-muted/20">
          <div className="px-6 py-4 bg-white border-b overflow-x-auto no-scrollbar flex gap-2 shrink-0">
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

          <div className="flex flex-grow overflow-hidden">
            <ScrollArea className="flex-grow">
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredMeals.map((meal) => (
                  <div 
                    key={meal.id}
                    className="bg-white p-3 rounded-2xl shadow-sm border border-border/40 flex gap-3 group hover:border-primary/30 transition-all"
                  >
                    <div className="relative h-16 w-16 rounded-xl overflow-hidden shrink-0">
                      <Image src={meal.imageUrl} alt={meal.name} fill className="object-cover" />
                    </div>
                    <div className="flex flex-col justify-between flex-grow">
                      <div>
                        <h4 className="font-bold text-xs leading-tight line-clamp-1">{meal.name}</h4>
                        <div className="flex gap-2 text-[8px] font-bold text-muted-foreground mt-1">
                          <span>{meal.protein}g P</span>
                          <span>{meal.calories} Kcal</span>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        className="h-7 w-full mt-2 rounded-lg bg-primary/5 hover:bg-primary hover:text-white text-primary text-[10px] font-black uppercase"
                        onClick={() => handleAddItem(meal)}
                        disabled={selectedItems.length >= COMBO_SIZE}
                      >
                        Selecionar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="w-64 bg-white border-l shrink-0 flex flex-col hidden md:flex">
              <div className="p-4 border-b bg-muted/30">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sua Escolha</h4>
              </div>
              <ScrollArea className="flex-grow">
                <div className="p-4 space-y-3">
                  {selectedItems.length === 0 ? (
                    <p className="text-[10px] text-center text-muted-foreground font-bold mt-10">Escolha pratos ao lado para preencher os slots.</p>
                  ) : (
                    selectedItems.map((item, idx) => (
                      <div key={`${item.id}-${idx}`} className="flex items-center justify-between gap-2 p-2 bg-muted/30 rounded-xl animate-in slide-in-from-right-2 duration-300">
                        <span className="text-[10px] font-bold truncate leading-tight">{item.name}</span>
                        <button onClick={() => handleRemoveItem(idx)} className="text-muted-foreground hover:text-destructive p-1"><Minus size={12} /></button>
                      </div>
                    ))
                  )}
                  {Array.from({ length: Math.max(0, COMBO_SIZE - selectedItems.length) }).map((_, i) => (
                    <div key={`empty-${i}`} className="border-2 border-dashed border-muted rounded-xl p-3 flex items-center justify-center">
                      <div className="h-4 w-4 rounded-full bg-muted/50" />
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="p-6 border-t bg-white">
                <div className="flex justify-between items-end mb-4">
                  <span className="text-[10px] font-black uppercase text-muted-foreground">Valor Fixo</span>
                  <span className="text-xl font-black text-primary">R$ 159,90</span>
                </div>
                <Button 
                  className="w-full h-12 rounded-full font-black uppercase text-[11px] tracking-tight shadow-lg shadow-primary/20"
                  disabled={selectedItems.length < COMBO_SIZE}
                  onClick={handleConfirm}
                >
                  Confirmar Kit <CheckCircle2 size={14} className="ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile bottom footer for selection summary */}
        <div className="md:hidden p-4 bg-white border-t shrink-0">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black uppercase">{selectedItems.length} de {COMBO_SIZE} selecionados</span>
            <span className="text-sm font-black text-primary">R$ 159,90</span>
          </div>
          <Button 
            className="w-full h-12 rounded-full font-black uppercase text-xs"
            disabled={selectedItems.length < COMBO_SIZE}
            onClick={handleConfirm}
          >
            Confirmar Kit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
