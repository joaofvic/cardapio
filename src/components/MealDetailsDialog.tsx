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
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-destructive">
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
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-destructive">
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
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-destructive">
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
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-none rounded-3xl">
        <div className="relative h-64 w-full">
          <Image 
            src={meal.imageUrl} 
            alt={meal.name}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>
        
        <div className="p-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="font-bold">{meal.category}</Badge>
                <div className="flex items-center gap-1 text-xs font-bold">
                  <Star size={14} className="fill-secondary text-secondary" />
                  <span>{meal.rating}</span>
                </div>
              </div>
              <DialogHeader>
                <DialogTitle className="text-3xl font-black text-foreground">{meal.name}</DialogTitle>
              </DialogHeader>
            </div>
            <div className="text-3xl font-black text-primary">
              R$ {meal.price.toFixed(2).replace('.', ',')}
            </div>
          </div>

          <p className="text-muted-foreground leading-relaxed mb-6">
            {meal.description}
          </p>

          {(meal.isDairyFree || meal.isGlutenFree || meal.isSugarFree) && (
            <div className="flex gap-4 mb-8 p-4 bg-destructive/5 rounded-2xl border border-destructive/10">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-destructive vertical-text flex items-center h-full">Restrições</h4>
              <div className="flex gap-4">
                {meal.isDairyFree && (
                  <div className="flex flex-col items-center gap-1">
                    <DairyFreeIcon />
                    <span className="text-[9px] font-black uppercase text-destructive">Sem Leite</span>
                  </div>
                )}
                {meal.isGlutenFree && (
                  <div className="flex flex-col items-center gap-1">
                    <GlutenFreeIcon />
                    <span className="text-[9px] font-black uppercase text-destructive">Sem Trigo</span>
                  </div>
                )}
                {meal.isSugarFree && (
                  <div className="flex flex-col items-center gap-1">
                    <SugarFreeIcon />
                    <span className="text-[9px] font-black uppercase text-destructive">Sem Açúcar</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="bg-muted/50 p-6 rounded-2xl mb-8">
            <h4 className="text-sm font-bold uppercase tracking-wider mb-4 text-foreground/70">Informações Nutricionais</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col">
                <span className="text-2xl font-black text-foreground">{meal.protein}g</span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Proteína</span>
              </div>
              <div className="flex flex-col border-l border-muted-foreground/20 pl-4">
                <span className="text-2xl font-black text-foreground">{meal.carbs}g</span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Carboidratos</span>
              </div>
              <div className="flex flex-col border-l border-muted-foreground/20 pl-4">
                <span className="text-2xl font-black text-foreground">{meal.calories}</span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Calorias</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 mb-8">
            <div className="flex items-center gap-2 text-sm font-medium">
              <CheckCircle2 size={18} className="text-primary" />
              <span>Preparado pelo chef e selado a vácuo para frescor</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium">
              <CheckCircle2 size={18} className="text-primary" />
              <span>Ingredientes orgânicos de origem local</span>
            </div>
          </div>

          <Button 
            className="w-full h-14 rounded-full text-lg font-bold bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20"
            onClick={() => {
              onAddToCart(meal);
              onClose();
            }}
          >
            Adicionar ao Pedido
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
