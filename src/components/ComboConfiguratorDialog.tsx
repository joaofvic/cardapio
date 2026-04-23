
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
import { Plus, Minus, CheckCircle2, Utensils, ArrowRight, ChevronRight, ChevronLeft } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ComboConfiguratorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (combo: Meal) => void;
}

const MARMITA_COUNT = 5;
const ITEMS_PER_MARMITA = 3;
const COMBO_PRICE = 159.90;

export function ComboConfiguratorDialog({ isOpen, onClose, onAddToCart }: ComboConfiguratorDialogProps) {
  // marmitas is an array of 5 arrays, each containing selected meals for that marmita
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
      const comboDescription = `Kit de 5 marmitas personalizadas (3 itens cada).`;
      const comboMeal: Meal = {
        id: `custom-combo-${Date.now()}`,
        name: "Combo Personalizado (15 Itens)",
        category: "Combo",
        description: comboDescription,
        price: COMBO_PRICE,
        protein: allItems.reduce((acc, m) => acc + m.protein, 0),
        carbs: allItems.reduce((acc, m) => acc + m.carbs, 0),
        calories: allItems.reduce((acc, m) => acc + m.calories, 0),
        imageUrl: MEALS.find(m => m.category === 'Combo')?.imageUrl || '',
        rating: 5.0
      };
      onAddToCart(comboMeal);
      setMarmitas(Array(MARMITA_COUNT).fill([]).map(() => []));
      setActiveIndex(0);
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

  const totalSelected = marmitas.flat().length;
  const totalRequired = MARMITA_COUNT * ITEMS_PER_MARMITA;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] h-[95vh] flex flex-col p-0 overflow-hidden border-none rounded-[3rem] bg-white shadow-2xl animate-in zoom-in duration-[3000ms] ease-in-out">
        {/* Header Section */}
        <div className="bg-primary p-8 text-white shrink-0 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                <Utensils className="text-white" size={24} />
              </div>
              <DialogTitle className="text-3xl font-black tracking-tighter">Monte seu Kit</DialogTitle>
            </div>
            <DialogDescription className="text-white/80 font-medium">
              Escolha 3 opções para cada uma das suas 5 marmitas semanais.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 space-y-4">
            {/* Visual Slots Indicator */}
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {marmitas.map((m, i) => {
                const isActive = activeIndex === i;
                const isComplete = m.length === ITEMS_PER_MARMITA;
                return (
                  <button
                    key={i} 
                    onClick={() => setActiveIndex(i)}
                    className={cn(
                      "flex flex-col items-center min-w-[130px] p-3 rounded-2xl border-2 transition-all duration-500",
                      isComplete 
                        ? "bg-white text-primary border-white" 
                        : (isActive ? "border-white bg-white/20 scale-105" : "border-white/30 bg-white/5 opacity-50")
                    )}
                  >
                    <span className={cn("text-[9px] font-black uppercase tracking-tighter mb-1", isComplete ? "text-primary" : "text-white")}>
                      Marmita {i + 1}
                    </span>
                    {isComplete ? (
                      <div className="flex flex-col items-center text-center animate-in zoom-in duration-500">
                        <CheckCircle2 size={16} className="text-primary mb-1" />
                        <span className="text-[10px] font-black uppercase leading-tight">CONCLUÍDA</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <span className="text-[14px] font-black">{m.length}/{ITEMS_PER_MARMITA}</span>
                        <span className="text-[8px] font-bold uppercase opacity-70">Opções</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-end mb-1">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Progresso Total do Combo</span>
                <span className="text-sm font-black">{totalSelected} / {totalRequired}</span>
              </div>
              <Progress value={(totalSelected / totalRequired) * 100} className="h-2.5 bg-white/20" />
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
                  onClick={() => setActiveCategory(cat.id as any)}
                  className={cn(
                    "px-4 py-2 rounded-full text-xs font-black uppercase transition-all whitespace-nowrap",
                    activeCategory === cat.id ? "bg-primary text-white shadow-md" : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-3">
              {activeIndex > 0 && (
                <Button variant="ghost" size="sm" onClick={prevMarmita} className="rounded-full gap-1">
                  <ChevronLeft size={16} /> Voltar
                </Button>
              )}
              {currentMarmitaComplete && activeIndex < MARMITA_COUNT - 1 && (
                <Button size="sm" onClick={nextMarmita} className="rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90 animate-bounce">
                  Próxima Marmita <ChevronRight size={16} />
                </Button>
              )}
            </div>
          </div>

          <div className="flex flex-grow overflow-hidden">
            <ScrollArea className="flex-grow">
              <div className="p-6">
                <div className="mb-6 flex items-center gap-4 bg-white p-6 rounded-[2rem] border border-primary/20 shadow-sm">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-xl">
                    {activeIndex + 1}
                  </div>
                  <div>
                    <h3 className="font-black text-lg leading-none mb-1 uppercase tracking-tight">Montando Marmita {activeIndex + 1}</h3>
                    <p className="text-xs text-muted-foreground font-medium">Selecione {ITEMS_PER_MARMITA - marmitas[activeIndex].length} opções para concluir esta refeição</p>
                  </div>
                  <div className="ml-auto flex gap-2">
                    {Array.from({ length: ITEMS_PER_MARMITA }).map((_, i) => (
                      <div 
                        key={i} 
                        className={cn(
                          "w-3 h-3 rounded-full transition-all duration-500",
                          marmitas[activeIndex].length > i ? "bg-primary scale-125" : "bg-muted border border-muted-foreground/20"
                        )} 
                      />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                            disabled={marmitas[activeIndex].length >= ITEMS_PER_MARMITA}
                          >
                            Selecionar
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollArea>

            {/* Summary Sidebar (Desktop Only) */}
            <div className="w-80 bg-white border-l shrink-0 flex flex-col hidden md:flex">
              <div className="p-6 border-b bg-muted/30">
                <h4 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Sua Seleção</h4>
              </div>
              <ScrollArea className="flex-grow">
                <div className="p-6 space-y-8">
                  {marmitas.map((m, mIdx) => (
                    <div key={mIdx} className={cn("space-y-3", activeIndex === mIdx ? "opacity-100" : "opacity-40")}>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">Marmita {mIdx + 1}</span>
                        <span className="text-[9px] font-bold text-muted-foreground">{m.length}/{ITEMS_PER_MARMITA}</span>
                      </div>
                      <div className="space-y-2">
                        {m.map((item, iIdx) => (
                          <div key={`${item.id}-${iIdx}`} className="flex items-center gap-3 p-2 bg-muted/30 rounded-xl group relative border border-transparent hover:border-primary/20 transition-all">
                            <div className="relative h-8 w-8 rounded-lg overflow-hidden shrink-0">
                              <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                            </div>
                            <h5 className="text-[9px] font-bold truncate flex-grow leading-tight">{item.name}</h5>
                            <button 
                              onClick={() => handleRemoveItem(mIdx, iIdx)} 
                              className="text-muted-foreground hover:text-destructive p-1 bg-white rounded-lg shadow-sm"
                            >
                              <Minus size={10} />
                            </button>
                          </div>
                        ))}
                        {m.length < ITEMS_PER_MARMITA && (
                          <div className="border border-dashed border-muted-foreground/30 rounded-xl p-3 flex items-center justify-center gap-2 opacity-50">
                            <Plus size={10} className="text-muted-foreground" />
                            <span className="text-[8px] font-bold uppercase text-muted-foreground">Escolher item {m.length + 1}</span>
                          </div>
                        )}
                      </div>
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
                  disabled={!isComboComplete}
                  onClick={handleConfirm}
                >
                  Confirmar Combo <CheckCircle2 size={16} className="ml-2" />
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
                Marmita {activeIndex + 1}: {marmitas[activeIndex].length}/{ITEMS_PER_MARMITA}
              </span>
              <span className="text-xl font-black text-primary">R$ 159,90</span>
            </div>
            {currentMarmitaComplete && activeIndex < MARMITA_COUNT - 1 && (
              <Button size="sm" onClick={nextMarmita} className="rounded-full bg-secondary text-secondary-foreground animate-pulse">
                Ir para Marmita {activeIndex + 2}
              </Button>
            )}
          </div>
          <Button 
            className="w-full h-14 rounded-full font-black uppercase text-xs shadow-xl shadow-primary/20"
            disabled={!isComboComplete}
            onClick={handleConfirm}
          >
            Finalizar e Adicionar à Cesta
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
