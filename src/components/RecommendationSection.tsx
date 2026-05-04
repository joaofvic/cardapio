
"use client";

import { useEffect, useState } from "react";
import { Meal } from "@/app/types/meal";
import { aiMealRecommendation } from "@/ai/flows/ai-meal-recommendation-flow";
import { MealCard } from "./MealCard";
import { Sparkles, ArrowRight } from "lucide-react";
import { useTable } from "@/lib/supabase";
import { cn } from "@/lib/utils";

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
  
  const { data: allMeals } = useTable<Meal>("meals", {
    orderBy: { column: "name", ascending: true },
  });

  useEffect(() => {
    async function fetchRecs() {
      if (browsingHistory.length === 0 || !allMeals || allMeals.length === 0) return;
      
      setLoading(true);
      try {
        const result = await aiMealRecommendation({
          browsingHistory,
          availableMeals: allMeals.map(m => ({
            name: m.name,
            category: m.category,
            description: m.description,
            protein: m.protein,
            carbs: m.carbs,
            calories: m.calories
          }))
        });

        const recMeals = allMeals.filter(m => 
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
  }, [browsingHistory, allMeals]);

  if (browsingHistory.length === 0 || (!loading && recommendations.length === 0)) return null;

  return (
    <section className="py-10 px-8 bg-gradient-to-br from-primary/10 via-white to-primary/5 rounded-[3rem] border border-primary/10 my-10 relative overflow-hidden shadow-sm">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32" />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10 relative z-10">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="p-2.5 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20 animate-pulse">
              <Sparkles size={20} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Sugerido para Você</span>
          </div>
          <h2 className="text-3xl font-black tracking-tighter text-foreground leading-none">SELEÇÃO DO CHEF</h2>
          <p className="text-sm font-medium text-muted-foreground max-w-sm">
            Com base no seu histórico, separamos estas delícias que combinam com seu perfil.
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-widest cursor-pointer group">
          Ver todas as opções <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-80 bg-white/50 rounded-[2rem] border border-border/20 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
          {recommendations.map(meal => (
            <div key={meal.id} className="animate-in slide-in-from-bottom-6 duration-500 [animation-fill-mode:both] ease-out">
              <MealCard 
                meal={meal} 
                onAddToCart={onAddToCart} 
                onOpenDetails={onOpenDetails} 
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
