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

          <p className="text-muted-foreground leading-relaxed mb-8">
            {meal.description}
          </p>

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
