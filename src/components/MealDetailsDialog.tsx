"use client";

import { Meal } from "@/app/types/meal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, CheckCircle2 } from "lucide-react";

const DairyFreeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 text-destructive">
    <path d="M16.5 14c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2Z" />
    <path d="M7 16a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z" />
    <path d="M12 2v3" />
    <path d="M12 11c0 3.3-2.7 6-6 6" />
    <path d="m3 3 18 18" />
    <path d="M11 11c.4.7.7 1.5.9 2.4" />
    <path d="M12 11c3.3 0 6 2.7 6 6" />
  </svg>
);

const GlutenFreeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 text-destructive">
    <path d="m3 3 18 18" />
    <path d="M10.5 4.5 12 6l1.5-1.5" />
    <path d="M12 6v12" />
    <path d="M10.5 19.5 12 18l1.5 1.5" />
    <path d="m15.5 14-2.5-2.5" />
    <path d="m8.5 10 2.5 2.5" />
    <path d="m8.5 14 2.5-2.5" />
    <path d="m15.5 10-2.5 2.5" />
  </svg>
);

const SugarFreeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 text-destructive">
    <path d="m3 3 18 18" />
    <path d="M16 6h2v2h-2z" />
    <path d="M12 6h2v2h-2z" />
    <path d="M8 6h2v2H8z" />
    <path d="M16 10h2v2h-2z" />
    <path d="M12 10h2v2h-2z" />
    <path d="M8 10h2v2H8z" />
  </svg>
);

interface MealDetailsDialogProps {
  meal: Meal | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (meal: Meal) => void;
}

export function MealDetailsDialog({ meal, isOpen, onClose, onAddToCart }: MealDetailsDialogProps) {
  if (!meal) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-none rounded-[3rem] bg-white shadow-2xl animate-in zoom-in duration-500">
        <div className="relative h-72 w-full">
          <Image 
            src={meal.imageUrl} 
            alt={meal.name}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
          <Badge className="absolute top-6 left-6 bg-white/95 text-primary border-none font-black px-4 py-2 uppercase tracking-widest shadow-xl">
            {meal.category}
          </Badge>
        </div>
        
        <div className="p-10 -mt-8 relative bg-white rounded-t-[3rem]">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-1.5 bg-secondary/20 px-3 py-1 rounded-full text-xs font-black text-secondary-foreground">
                  <Star size={16} className="fill-secondary text-secondary" />
                  <span>{meal.rating}</span>
                </div>
              </div>
              <DialogHeader>
                <DialogTitle className="text-4xl font-black text-foreground tracking-tighter leading-none">{meal.name}</DialogTitle>
              </DialogHeader>
            </div>
            <div className="text-3xl font-black text-primary bg-primary/5 px-4 py-2 rounded-2xl">
              R$ {meal.price.toFixed(2).replace('.', ',')}
            </div>
          </div>

          <p className="text-muted-foreground leading-relaxed mb-8 text-lg font-medium">
            {meal.description}
          </p>

          {(meal.isDairyFree || meal.isGlutenFree || meal.isSugarFree) && (
            <div className="flex flex-col gap-6 mb-10 p-8 bg-destructive/5 rounded-[2.5rem] border-2 border-destructive/10 animate-in slide-in-from-bottom-4 duration-700">
              <h4 className="text-xs font-black uppercase tracking-[0.3em] text-destructive text-center">Restrições Alimentares</h4>
              <div className="flex justify-around items-center">
                {meal.isDairyFree && (
                  <div className="flex flex-col items-center gap-3 transition-transform hover:scale-110 duration-300">
                    <div className="bg-white p-4 rounded-3xl shadow-md border border-destructive/20"><DairyFreeIcon /></div>
                    <span className="text-[11px] font-black uppercase text-destructive tracking-tight">Sem Leite</span>
                  </div>
                )}
                {meal.isGlutenFree && (
                  <div className="flex flex-col items-center gap-3 transition-transform hover:scale-110 duration-300">
                    <div className="bg-white p-4 rounded-3xl shadow-md border border-destructive/20"><GlutenFreeIcon /></div>
                    <span className="text-[11px] font-black uppercase text-destructive tracking-tight">Sem Trigo</span>
                  </div>
                )}
                {meal.isSugarFree && (
                  <div className="flex flex-col items-center gap-3 transition-transform hover:scale-110 duration-300">
                    <div className="bg-white p-4 rounded-3xl shadow-md border border-destructive/20"><SugarFreeIcon /></div>
                    <span className="text-[11px] font-black uppercase text-destructive tracking-tight">Sem Açúcar</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="bg-muted/30 p-8 rounded-[2.5rem] mb-10 border border-border/40">
            <h4 className="text-xs font-black uppercase tracking-widest mb-6 text-foreground/50">Tabela Nutricional</h4>
            <div className="grid grid-cols-3 gap-8">
              <div className="flex flex-col">
                <span className="text-3xl font-black text-foreground leading-none">{meal.protein}g</span>
                <span className="text-[11px] font-bold text-muted-foreground uppercase mt-2">Proteína</span>
              </div>
              <div className="flex flex-col border-l border-muted-foreground/10 pl-8">
                <span className="text-3xl font-black text-foreground leading-none">{meal.carbs}g</span>
                <span className="text-[11px] font-bold text-muted-foreground uppercase mt-2">Carbo</span>
              </div>
              <div className="flex flex-col border-l border-muted-foreground/10 pl-8">
                <span className="text-3xl font-black text-foreground leading-none">{meal.calories}</span>
                <span className="text-[11px] font-bold text-muted-foreground uppercase mt-2">Kcal</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 mb-10">
            <div className="flex items-center gap-4 text-sm font-bold bg-muted/20 p-4 rounded-2xl">
              <CheckCircle2 size={24} className="text-primary shrink-0" />
              <span>Preparado pelo chef e selado a vácuo para frescor total</span>
            </div>
            <div className="flex items-center gap-4 text-sm font-bold bg-muted/20 p-4 rounded-2xl">
              <CheckCircle2 size={24} className="text-primary shrink-0" />
              <span>Ingredientes 100% orgânicos de pequenos produtores</span>
            </div>
          </div>

          <Button 
            className="w-full h-20 rounded-full text-xl font-black bg-primary hover:bg-primary/90 text-white shadow-2xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-95 uppercase tracking-tight"
            onClick={() => {
              onAddToCart(meal);
              onClose();
            }}
          >
            Adicionar à Cesta
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
