
"use client";

import Image from "next/image";
import { Plus, Star } from "lucide-react";
import { Meal } from "@/app/types/meal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
        <div className="absolute top-3 left-3">
          <Badge className="bg-white/90 text-primary hover:bg-white/100 border-none font-bold">
            {meal.category}
          </Badge>
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
            ${meal.price.toFixed(2)}
          </span>
        </div>
        
        <p className="text-muted-foreground text-sm line-clamp-2 mb-4 leading-relaxed">
          {meal.description}
        </p>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex gap-3 text-[10px] font-bold text-muted-foreground">
            <div className="flex flex-col">
              <span className="text-foreground">{meal.protein}g</span>
              <span>PROTEIN</span>
            </div>
            <div className="flex flex-col border-l border-muted pl-3">
              <span className="text-foreground">{meal.carbs}g</span>
              <span>CARBS</span>
            </div>
            <div className="flex flex-col border-l border-muted pl-3">
              <span className="text-foreground">{meal.calories}</span>
              <span>CALORIES</span>
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
