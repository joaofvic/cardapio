
"use client";

import { useEffect, useState } from "react";
import { Meal } from "@/app/types/meal";
import { MEALS } from "@/app/data/meals";
import { aiMealRecommendation } from "@/ai/flows/ai-meal-recommendation-flow";
import { MealCard } from "./MealCard";
import { Sparkles } from "lucide-react";

interface RecommendationSectionProps {
  browsingHistory: string[];
  onAddToCart: (meal: Meal) => void;
  onOpenDetails: (meal: Meal) => void;
}

export function RecommendationSection({ 
  browsingHistory, 
  onAddToCart, 
  onOpenDetails 
}: RecommendationSectionProps) {
  const [recommendations, setRecommendations] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchRecs() {
      if (browsingHistory.length === 0) return;
      
      setLoading(true);
      try {
        const result = await aiMealRecommendation({
          browsingHistory,
          availableMeals: MEALS.map(m => ({
            name: m.name,
            category: m.category,
            description: m.description,
            protein: m.protein,
            carbs: m.carbs,
            calories: m.calories
          }))
        });

        const recMeals = MEALS.filter(m => 
          result.recommendations.includes(m.name)
        );
        setRecommendations(recMeals);
      } catch (error) {
        console.error("AI Recommendation Error:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchRecs();
  }, [browsingHistory]);

  if (browsingHistory.length === 0 || (!loading && recommendations.length === 0)) return null;

  return (
    <div className="py-8 px-4 bg-primary/5 rounded-3xl my-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-secondary rounded-xl">
          <Sparkles size={20} className="text-secondary-foreground" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-foreground">Popular Favorites</h2>
          <p className="text-xs text-muted-foreground">Based on your recent browsing</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-muted rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map(meal => (
            <MealCard 
              key={meal.id} 
              meal={meal} 
              onAddToCart={onAddToCart} 
              onOpenDetails={onOpenDetails} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
