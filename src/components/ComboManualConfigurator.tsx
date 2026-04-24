"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MEALS } from "@/app/data/meals";
import { Meal } from "@/app/types/meal";
import { Plus, Minus, CheckCircle2, Utensils, ChevronRight, ChevronLeft, ShoppingBag, Scale, Save } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ComboManualConfiguratorProps {
  onAddToCart: (combo: Meal) => void;
  initialData?: Meal | null;
}

const MIN_MARMITAS = 5;
const ITEMS_PER_MARMITA = 3;

const SIZES = [
  { label: '300g', price: 17.90 },
  { label: '400g', price: 19.90 },
  { label: '500g', price: 22.90 },
];

type ConfigStep = 'quantity' | 'size' | 'items';

export function ComboManualConfigurator({ onAddToCart, initialData }: ComboManualConfiguratorProps) {
  const [step, setStep] = useState<ConfigStep>('quantity');
  const [marmitaCount, setMarmitaCount] = useState(MIN_MARMITAS);
  const [selectedSize, setSelectedSize] = useState(SIZES[0]);
  const [marmitas, setMarmitas] = useState<Meal[][]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState<'All' | 'Chicken' | 'Beef' | 'Fish' | 'Veggie'>('All');

  useEffect(() => {
    if (initialData?.configuration) {
      setMarmitaCount(initialData.configuration.marmitaCount);
      const matchedSize = SIZES.find(s => s.label === initialData.configuration?.selectedSize.label);
      if (matchedSize) setSelectedSize(matchedSize);
      setMarmitas(initialData.configuration.marmitas);
      setStep('items');
    }
  }, [initialData]);

  const handleStartConfiguration = () => {
    if (!initialData) {
      setMarmitas(Array(marmitaCount).fill([]).map(() => []));
    }
    setStep('items');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
    if (activeIndex < marmitaCount - 1 && marmitas[activeIndex].length === ITEMS_PER_MARMITA) {
      setActiveIndex(activeIndex + 1);
    }
  };

  const prevMarmita = () => {
    if (activeIndex > 0) {
      setActiveIndex(activeIndex - 1);
    }
  };

  const currentPrice = marmitaCount * selectedSize.price;
  const isComboComplete = marmitas.length > 0 && marmitas.every(m => m.length === ITEMS_PER_MARMITA);
  const currentMarmitaComplete = marmitas[activeIndex]?.length === ITEMS_PER_MARMITA;

  const handleConfirm = () => {
    if (isComboComplete) {
      const allItems = marmitas.flat();
      const comboMeal: Meal = {
        id: initialData?.id || `custom-combo-${Date.now()}`,
        name: `Combo Personalizado (${marmitaCount}x ${selectedSize.label})`,
        category: "Combo",
        description: `Kit de ${marmitaCount} marmitas de ${selectedSize.label} personalizadas (3 itens cada).`,
        price: currentPrice,
        protein: allItems.reduce((acc, m) => acc + m.protein, 0),
        carbs: allItems.reduce((acc, m) => acc + m.carbs, 0),
        calories: allItems.reduce((acc, m) => acc + m.calories, 0),
        imageUrl: MEALS.find(m => m.category === 'Combo')?.imageUrl || '',
        rating: 5.0,
        configuration: {
          marmitaCount,
          selectedSize,
          marmitas
        }
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
  const totalRequired = marmitaCount * ITEMS_PER_MARMITA;

  if (step === 'quantity') {
    return (
      <div className="max-w-md mx-auto py-12 px-4 animate-in slide-in-from-bottom [animation-duration:500ms] ease-in-out">
        <div className="bg-white rounded-[3rem] p-10 shadow-xl border border-border/40 text-center">
          <div className="bg-primary/10 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-in zoom-in [animation-duration:500ms]">
            <ShoppingBag className="text-primary" size={40} />
          </div>
          
          <h2 className="text-3xl font-black tracking-tighter text-foreground mb-4 leading-none">
            {initialData ? 'Editar Quantidade' : 'Quantas marmitas?'}
          </h2>
          <p className="text-muted-foreground font-medium mb-10">
            O mínimo para este combo é de <span className="text-primary font-black">{MIN_MARMITAS} unidades</span>.
          </p>

          <div className="flex items-center justify-center gap-8 mb-12">
            <button 
              onClick={() => setMarmitaCount(Math.max(MIN_MARMITAS, marmitaCount - 1))}
              className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all active:scale-90 border border-border/20"
            >
              <Minus size={24} strokeWidth={3} />
            </button>
            <div className="flex flex-col items-center">
              <span className="text-6xl font-black text-foreground tabular-nums leading-none">{marmitaCount}</span>
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-2">Unidades</span>
            </div>
            <button 
              onClick={() => setMarmitaCount(marmitaCount + 1)}
              className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all active:scale-90 border border-border/20"
            >
              <Plus size={24} strokeWidth={3} />
            </button>
          </div>

          <Button 
            className="w-full h-20 rounded-full text-xl font-black bg-primary hover:bg-primary/90 text-white shadow-2xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-95 uppercase tracking-tighter"
            onClick={() => setStep('size')}
          >
            Próximo Passo
            <ChevronRight size={24} className="ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  if (step === 'size') {
    return (
      <div className="max-w-md mx-auto py-12 px-4 animate-in slide-in-from-right [animation-duration:500ms] ease-in-out">
        <div className="bg-white rounded-[3rem] p-10 shadow-xl border border-border/40 text-center">
          <div className="bg-primary/10 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <Scale className="text-primary" size={40} />
          </div>
          
          <h2 className="text-3xl font-black tracking-tighter text-foreground mb-4 leading-none">
            Escolha o Tamanho
          </h2>
          <p className="text-muted-foreground font-medium mb-10">
            Todas as {marmitaCount} marmitas terão o mesmo tamanho.
          </p>

          <div className="grid grid-cols-1 gap-4 mb-10">
            {SIZES.map((size) => (
              <button
                key={size.label}
                onClick={() => setSelectedSize(size)}
                className={cn(
                  "p-6 rounded-[2rem] border-2 transition-all flex items-center justify-between group",
                  selectedSize.label === size.label 
                    ? "border-primary bg-primary/5 shadow-inner" 
                    : "border-muted-foreground/10 bg-white hover:border-primary/30"
                )}
              >
                <div className="flex flex-col items-start">
                  <span className={cn("text-xl font-black", selectedSize.label === size.label ? "text-primary" : "text-foreground")}>
                    {size.label}
                  </span>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Por marmita</span>
                </div>
                <span className={cn("text-lg font-black", selectedSize.label === size.label ? "text-primary" : "text-foreground")}>
                  R$ {size.price.toFixed(2).replace('.', ',')}
                </span>
              </button>
            ))}
          </div>

          <div className="bg-primary/5 p-6 rounded-3xl mb-10 border border-primary/10">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1 block">Total do Combo</span>
            <span className="text-3xl font-black text-primary">R$ {currentPrice.toFixed(2).replace('.', ',')}</span>
          </div>

          <div className="flex gap-4">
            <Button 
              variant="outline"
              className="flex-1 h-20 rounded-full text-lg font-black border-muted-foreground/20 hover:bg-muted"
              onClick={() => setStep('quantity')}
            >
              Voltar
            </Button>
            <Button 
              className="flex-[2] h-20 rounded-full text-xl font-black bg-primary hover:bg-primary/90 text-white shadow-2xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-95 uppercase tracking-tighter"
              onClick={handleStartConfiguration}
            >
              Montar Itens
              <ChevronRight size={24} className="ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in [animation-duration:500ms]">
      <div className="bg-primary rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
              <Utensils size={28} />
            </div>
            <div>
              <h2 className="text-3xl font-black tracking-tighter leading-none">{initialData ? 'Editar Kit' : 'Monte seu Kit'}</h2>
              <p className="text-white/80 text-xs font-bold mt-2 uppercase tracking-widest">
                Marmitas de {selectedSize.label} • Escolha 3 itens para a Marmita {activeIndex + 1}
              </p>
            </div>
          </div>
          <button 
            onClick={() => setStep('quantity')}
            className="bg-white/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-white/20 transition-colors"
          >
            Configurar
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
          {marmitas.map((m, i) => {
            const isActive = activeIndex === i;
            const isComplete = m?.length === ITEMS_PER_MARMITA;
            return (
              <button
                key={i} 
                onClick={() => setActiveIndex(i)}
                className={cn(
                  "flex flex-col items-center min-w-[120px] p-3 rounded-2xl border-2 transition-all duration-300",
                  isComplete 
                    ? "bg-white text-primary border-white" 
                    : (isActive ? "border-white bg-white/20 scale-105" : "border-white/30 bg-white/5 opacity-50")
                )}
              >
                <span className={cn("text-[8px] font-black uppercase mb-1", isComplete ? "text-primary" : "text-white")}>Marmita {i + 1}</span>
                {isComplete ? (
                  <div className="flex flex-col items-center animate-in zoom-in [animation-duration:300ms]">
                    <CheckCircle2 size={16} />
                    <span className="text-[10px] font-black uppercase mt-1">OK</span>
                  </div>
                ) : (
                  <span className="text-lg font-black">{m?.length || 0}/{ITEMS_PER_MARMITA}</span>
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

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-border/40 overflow-hidden flex flex-col md:flex-row">
        <div className="flex-grow flex flex-col">
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
              {currentMarmitaComplete && activeIndex < marmitaCount - 1 && (
                <Button size="sm" onClick={nextMarmita} className="bg-secondary text-secondary-foreground rounded-full h-8 text-[10px] font-black animate-pulse">
                  PRÓXIMA <ChevronRight size={14} className="ml-1" />
                </Button>
              )}
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMeals.map((meal) => (
              <div 
                key={meal.id}
                className="bg-muted/30 p-4 rounded-[2rem] border border-transparent hover:border-primary/20 transition-all flex flex-col group"
              >
                <div className="relative h-24 w-full rounded-2xl overflow-hidden mb-3">
                  <Image src={meal.imageUrl} alt={meal.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <h4 className="font-black text-xs leading-tight mb-2 line-clamp-1">{meal.name}</h4>
                <div className="mt-auto flex items-center justify-between">
                  <span className="text-[10px] font-bold text-muted-foreground">{meal.calories} kcal</span>
                  <Button 
                    size="sm" 
                    className="h-8 px-4 rounded-xl bg-primary text-white text-[9px] font-black uppercase"
                    onClick={() => handleAddItem(meal)}
                    disabled={marmitas[activeIndex]?.length >= ITEMS_PER_MARMITA}
                  >
                    Escolher
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full md:w-72 bg-muted/20 border-t md:border-t-0 md:border-l p-6 shrink-0">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Marmita {activeIndex + 1}</h4>
            <span className="text-[10px] font-black text-primary">{marmitas[activeIndex]?.length || 0}/{ITEMS_PER_MARMITA} Itens</span>
          </div>
          <div className="space-y-3 mb-8">
            {marmitas[activeIndex]?.map((item, iIdx) => (
              <div key={`${item.id}-${iIdx}`} className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-primary/10 animate-in slide-in-from-right [animation-duration:300ms]">
                <div className="relative h-10 w-10 rounded-xl overflow-hidden shrink-0">
                  <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                </div>
                <span className="text-[10px] font-bold flex-grow truncate">{item.name}</span>
                <button onClick={() => handleRemoveItem(activeIndex, iIdx)} className="text-muted-foreground hover:text-destructive p-1">
                  <Minus size={14} />
                </button>
              </div>
            ))}
            {(marmitas[activeIndex]?.length || 0) < ITEMS_PER_MARMITA && (
              <div className="border border-dashed border-muted-foreground/30 rounded-2xl p-4 flex items-center justify-center text-muted-foreground/50 italic text-[10px] font-bold">
                Escolha mais {ITEMS_PER_MARMITA - (marmitas[activeIndex]?.length || 0)} itens...
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-muted-foreground/10">
            <div className="flex justify-between items-end mb-4">
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-muted-foreground uppercase">Total do seu Kit</span>
                <span className="text-2xl font-black text-primary">R$ {currentPrice.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>
            <Button 
              className="w-full h-14 rounded-full font-black uppercase text-xs shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
              disabled={!isComboComplete}
              onClick={handleConfirm}
            >
              {initialData ? <Save size={16} /> : null}
              {initialData ? 'SALVAR ALTERAÇÕES' : 'FINALIZAR KIT'}
            </Button>
            <p className="text-[9px] font-bold text-center text-muted-foreground mt-4 uppercase tracking-tighter">
              {marmitaCount} Marmitas ({selectedSize.label}) • {totalRequired} Itens
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}