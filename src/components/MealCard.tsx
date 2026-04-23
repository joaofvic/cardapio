"use client";

import Image from "next/image";
import { Plus, Star } from "lucide-react";
import { Meal } from "@/app/types/meal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const DairyFreeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-destructive">
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
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-destructive">
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
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-destructive">
    <path d="m3 3 18 18" />
    <path d="M16 6h2v2h-2z" />
    <path d="M12 6h2v2h-2z" />
    <path d="M8 6h2v2H8z" />
    <path d="M16 10h2v2h-2z" />
    <path d="M12 10h2v2h-2z" />
    <path d="M8 10h2v2H8z" />
  </svg>
);

interface MealCardProps {
  meal: Meal;
  onAddToCart: (meal: Meal) => void;
  onOpenDetails: (meal: Meal) => void;
}

export function MealCard({ meal, onAddToCart, onOpenDetails }: MealCardProps) {
  return (
    <Card 
      className="overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group"
      onClick={() => onOpenDetails(meal)}
    >
      <div className="relative h-48 w-full">
        <Image 
          src={meal.imageUrl} 
          alt={meal.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          data-ai-hint="meal food"
        />
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <Badge className="bg-white/90 text-primary hover:bg-white/100 border-none font-bold">
            {meal.category}
          </Badge>
          
          <div className="flex gap-1">
            <TooltipProvider>
              {meal.isDairyFree && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="bg-white/90 p-1.5 rounded-full shadow-sm">
                      <DairyFreeIcon />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent><p className="text-xs font-bold">Sem Leite</p></TooltipContent>
                </Tooltip>
              )}
              {meal.isGlutenFree && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="bg-white/90 p-1.5 rounded-full shadow-sm">
                      <GlutenFreeIcon />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent><p className="text-xs font-bold">Sem Glúten</p></TooltipContent>
                </Tooltip>
              )}
              {meal.isSugarFree && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="bg-white/90 p-1.5 rounded-full shadow-sm">
                      <SugarFreeIcon />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent><p className="text-xs font-bold">Sem Açúcar</p></TooltipContent>
                </Tooltip>
              )}
            </TooltipProvider>
          </div>
        </div>
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 px-2 py-0.5 rounded-full text-[10px] font-bold text-foreground">
          <Star size={12} className="fill-secondary text-secondary" />
          {meal.rating || 4.5}
        </div>
      </div>
      <CardContent className="p-4 bg-white">
        <div className="flex justify-between items-start gap-2 mb-2">
          <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">
            {meal.name}
          </h3>
          <span className="font-bold text-primary text-lg">
            R$ {meal.price.toFixed(2).replace('.', ',')}
          </span>
        </div>
        
        <p className="text-muted-foreground text-sm line-clamp-2 mb-4 leading-relaxed">
          {meal.description}
        </p>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex gap-3 text-[10px] font-bold text-muted-foreground">
            <div className="flex flex-col">
              <span className="text-foreground">{meal.protein}g</span>
              <span>PROTEÍNA</span>
            </div>
            <div className="flex flex-col border-l border-muted pl-3">
              <span className="text-foreground">{meal.carbs}g</span>
              <span>CARBO</span>
            </div>
            <div className="flex flex-col border-l border-muted pl-3">
              <span className="text-foreground">{meal.calories}</span>
              <span>CALORIAS</span>
            </div>
          </div>
          
          <Button 
            size="icon" 
            className="rounded-full bg-primary hover:bg-primary/90 text-white shadow-lg transition-transform hover:scale-110 active:scale-95"
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(meal);
            }}
          >
            <Plus size={20} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
