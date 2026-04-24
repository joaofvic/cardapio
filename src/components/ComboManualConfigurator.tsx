
"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { MEALS } from "@/app/data/meals";
import { Meal } from "@/app/types/meal";
import { Plus, Minus, CheckCircle2, Utensils, ChevronRight, ChevronLeft } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ComboManualConfiguratorProps {
  onAddToCart: (combo: Meal) => void;
}

const MARMITA_COUNT = 5;
const ITEMS_PER_MARMITA = 3;
const COMBO_PRICE = 159.90;

export function ComboManualConfigurator({ onAddToCart }: ComboManualConfiguratorProps) {
  const [marmitas, setMarmitas] = useState<Meal[][]>(Array(MARMITA_COUNT).fill([]).map(() => []));
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState<'All' | 'Chicken' | 'Beef' | 'Fish' | 'Veggie'>('All');

  const filteredMeals = useMemo(() => {
    const pool = MEALS.filter(m => m.category !== 'Combo');
    if (activeCategory === 'All') return pool;
    return pool.filter(m => m.category === activeCategory);
  }, [activeCategory]);

  const handleAddItem = (meal: Meal) => {
    if (marmitas[activeIndex].length < ITEMS_PER_MARMITA) {
      const newMarmitas = [...marmitas];
      newMarmitas[activeIndex] = [...newMarmitas[activeIndex], meal];
      setMarmitas(newMarmitas);
    }
  };

  const handleRemoveItem = (marmitaIdx: number, itemIdx: number) => {
    const newMarmitas = [...marmitas];
    newMarmitas[marmitaIdx] = newMarmitas[marmitaIdx].filter((_, i) => i !== itemIdx);
    setMarmitas(newMarmitas);
  };

  const nextMarmita = () => {
    if (activeIndex < MARMITA_COUNT - 1 && marmitas[activeIndex].length === ITEMS_PER_MARMITA) {
      setActiveIndex(activeIndex + 1);
    }
  };

  const prevMarmita = () => {
    if (activeIndex > 0) {
      setActiveIndex(activeIndex - 1);
    }
  };

  const isComboComplete = marmitas.every(m => m.length === ITEMS_PER_MARMITA);
  const currentMarmitaComplete = marmitas[activeIndex].length === ITEMS_PER_MARMITA;

  const handleConfirm = () => {
    if (isComboComplete) {
      const allItems = marmitas.flat();
      const comboMeal: Meal = {
        id: `custom-combo-${Date.now()}`,
        name: "Combo Personalizado (15 Itens)",
        category: "Combo",
        description: "Kit de 5 marmitas personalizadas (3 itens cada).",
        price: COMBO_PRICE,
        protein: allItems.reduce((acc, m) => acc + m.protein, 0),
        carbs: allItems.reduce((acc, m) => acc + m.carbs, 0),
        calories: allItems.reduce((acc, m) => acc + m.calories, 0),
        imageUrl: MEALS.find(m => m.category === 'Combo')?.imageUrl || '',
        rating: 5.0
      };
      onAddToCart(comboMeal);
    }
  };

  const categories = [
    { id: 'All', label: 'Todos' },
    { id: 'Chicken', label: 'Frango' },
    { id: 'Beef', label: 'Carne' },
    { id: 'Fish', label: 'Peixe' },
    { id: 'Veggie', label: 'Legumes' }
  ];

  const totalSelected = marmitas.flat().length;
  const totalRequired = MARMITA_COUNT * ITEMS_PER_MARMITA;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-[3000ms]">
      {/* Header Info */}
      <div className="bg-primary rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
            <Utensils size={28} />
          </div>
          <div>
            <h2 className="text-3xl font-black tracking-tighter leading-none">Monte seu Kit</h2>
            <p className="text-white/80 text-xs font-bold mt-2 uppercase tracking-widest">Escolha 3 itens por marmita</p>
          </div>
        </div>

        {/* Slot Indicators */}
        <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
          {marmitas.map((m, i) => {
            const isActive = activeIndex === i;
            const isComplete = m.length === ITEMS_PER_MARMITA;
            return (
              <button
                key={i} 
                onClick={() => setActiveIndex(i)}
                className={cn(
                  "flex flex-col items-center min-w-[120px] p-3 rounded-2xl border-2 transition-all duration-500",
                  isComplete 
                    ? "bg-white text-primary border-white" 
                    : (isActive ? "border-white bg-white/20 scale-105" : "border-white/30 bg-white/5 opacity-50")
                )}
              >
                <span className={cn("text-[8px] font-black uppercase mb-1", isComplete ? "text-primary" : "text-white")}>Marmita {i + 1}</span>
                {isComplete ? (
                  <div className="flex flex-col items-center animate-in zoom-in duration-500">
                    <CheckCircle2 size={16} />
                    <span className="text-[10px] font-black uppercase mt-1">OK</span>
                  </div>
                ) : (
                  <span className="text-lg font-black">{m.length}/{ITEMS_PER_MARMITA}</span>
                )}
              </button>
            );
          })}
        </div>

        <div className="space-y-2 mt-4">
          <div className="flex justify-between items-end">
            <span className="text-[9px] font-black uppercase opacity-80">Progresso Geral</span>
            <span className="text-xs font-black">{totalSelected} / {totalRequired}</span>
          </div>
          <Progress value={(totalSelected / totalRequired) * 100} className="h-2 bg-white/20" />
        </div>
      </div>

      {/* Selector Area */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-border/40 overflow-hidden flex flex-col md:flex-row">
        <div className="flex-grow flex flex-col">
          {/* Categories & Nav */}
          <div className="p-4 border-b flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
            <div className="flex gap-2">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id as any)}
                  className={cn(
                    "px-4 py-2 rounded-full text-[10px] font-black uppercase transition-all whitespace-nowrap",
                    activeCategory === cat.id ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            
            <div className="flex gap-2 shrink-0">
              {activeIndex > 0 && (
                <Button variant="ghost" size="sm" onClick={prevMarmita} className="rounded-full h-8 text-[10px] font-black">
                  <ChevronLeft size={14} className="mr-1" /> VOLTAR
                </Button>
              )}
              {currentMarmitaComplete && activeIndex < MARMITA_COUNT - 1 && (
                <Button size="sm" onClick={nextMarmita} className="bg-secondary text-secondary-foreground rounded-full h-8 text-[10px] font-black animate-pulse">
                  PRÓXIMA <ChevronRight size={14} className="ml-1" />
                </Button>
              )}
            </div>
          </div>

          {/* Grid Area */}
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMeals.map((meal) => (
              <div 
                key={meal.id}
                className="bg-muted/30 p-4 rounded-[2rem] border border-transparent hover:border-primary/20 transition-all flex flex-col group"
              >
                <div className="relative h-24 w-full rounded-2xl overflow-hidden mb-3">
                  <Image src={meal.imageUrl} alt={meal.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
                <h4 className="font-black text-xs leading-tight mb-2 line-clamp-1">{meal.name}</h4>
                <div className="mt-auto flex items-center justify-between">
                  <span className="text-[10px] font-bold text-muted-foreground">{meal.calories} kcal</span>
                  <Button 
                    size="sm" 
                    className="h-8 px-4 rounded-xl bg-primary text-white text-[9px] font-black uppercase"
                    onClick={() => handleAddItem(meal)}
                    disabled={marmitas[activeIndex].length >= ITEMS_PER_MARMITA}
                  >
                    Escolher
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary (Desktop or Side) */}
        <div className="w-full md:w-72 bg-muted/20 border-t md:border-t-0 md:border-l p-6 shrink-0">
          <h4 className="text-[10px] font-black uppercase tracking-widest mb-6 text-muted-foreground">Marmita {activeIndex + 1}</h4>
          <div className="space-y-3 mb-8">
            {marmitas[activeIndex].map((item, iIdx) => (
              <div key={`${item.id}-${iIdx}`} className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-primary/10 animate-in slide-in-from-right duration-500">
                <div className="relative h-10 w-10 rounded-xl overflow-hidden shrink-0">
                  <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                </div>
                <span className="text-[10px] font-bold flex-grow truncate">{item.name}</span>
                <button onClick={() => handleRemoveItem(activeIndex, iIdx)} className="text-muted-foreground hover:text-destructive p-1">
                  <Minus size={14} />
                </button>
              </div>
            ))}
            {marmitas[activeIndex].length < ITEMS_PER_MARMITA && (
              <div className="border border-dashed border-muted-foreground/30 rounded-2xl p-4 flex items-center justify-center text-muted-foreground/50 italic text-[10px] font-bold">
                Aguardando itens...
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-muted-foreground/10">
            <div className="flex justify-between items-end mb-4">
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-muted-foreground uppercase">Valor do Kit</span>
                <span className="text-2xl font-black text-primary">R$ 159,90</span>
              </div>
            </div>
            <Button 
              className="w-full h-14 rounded-full font-black uppercase text-xs shadow-lg shadow-primary/20"
              disabled={!isComboComplete}
              onClick={handleConfirm}
            >
              FINALIZAR KIT
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
