
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Meal } from "@/app/types/meal";
import { MEALS } from "@/app/data/meals";
import { Upload, FileText, Sparkles, Loader2, CheckCircle2, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { analyzeMealPlan } from "@/ai/flows/analyze-meal-plan-flow";

interface ComboAIConfiguratorProps {
  onAddToCart: (combo: Meal) => void;
}

export function ComboAIConfigurator({ onAddToCart }: ComboAIConfiguratorProps) {
  const [loading, setLoading] = useState(false);
  const [textPlan, setTextPlan] = useState("");
  const [photoDataUri, setPhotoDataUri] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<Meal[] | null>(null);
  const { toast } = useToast();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoDataUri(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!textPlan && !photoDataUri) {
      toast({
        variant: "destructive",
        title: "Dados insuficientes",
        description: "Por favor, envie uma foto ou descreva seu plano alimentar.",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await analyzeMealPlan({
        textPlan: textPlan || undefined,
        photoDataUri: photoDataUri || undefined,
        availableMeals: MEALS.filter(m => m.category !== 'Combo').map(m => ({
          name: m.name,
          category: m.category,
          description: m.description,
          protein: m.protein,
          carbs: m.carbs,
          calories: m.calories
        }))
      });

      const matchedMeals = MEALS.filter(m => result.recommendations.includes(m.name));
      setRecommendations(matchedMeals);
      
      toast({
        title: "Análise Concluída!",
        description: "Encontramos os melhores pratos para o seu plano.",
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Erro na análise",
        description: "Não conseguimos processar seu plano agora. Tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (!recommendations || recommendations.length === 0) return;

    // Criar um combo de 5 marmitas baseado nas recomendações (repetindo se necessário)
    const marmitas: Meal[][] = Array(5).fill([]).map(() => {
      // Pega 3 itens aleatórios das recomendações para cada marmita
      const items = [...recommendations].sort(() => 0.5 - Math.random()).slice(0, 3);
      // Se tiver menos de 3 recomendações, completa com outros pratos saudáveis
      while (items.length < 3) {
        items.push(MEALS.filter(m => m.category !== 'Combo')[0]);
      }
      return items;
    });

    const comboMeal: Meal = {
      id: `ai-combo-${Date.now()}`,
      name: "Combo Plano Alimentar IA",
      category: "Combo",
      description: "Kit personalizado baseado nas suas necessidades nutricionais enviadas.",
      price: 159.90, // Valor padrão para 5 marmitas
      protein: marmitas.flat().reduce((acc, m) => acc + m.protein, 0),
      carbs: marmitas.flat().reduce((acc, m) => acc + m.carbs, 0),
      calories: marmitas.flat().reduce((acc, m) => acc + m.calories, 0),
      imageUrl: MEALS.find(m => m.category === 'Combo')?.imageUrl || '',
      rating: 5.0,
      configuration: {
        marmitaCount: 5,
        selectedSize: { label: '400g', price: 19.90 },
        marmitas
      }
    };

    onAddToCart(comboMeal);
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 animate-in fade-in slide-in-from-bottom-4 [animation-duration:500ms]">
      <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-border/40">
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-primary/10 p-4 rounded-3xl">
            <Sparkles className="text-primary" size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-black tracking-tighter text-foreground leading-none">Sua Dieta na Prática</h2>
            <p className="text-muted-foreground font-medium mt-2">Envie seu plano alimentar para montarmos seu kit ideal.</p>
          </div>
        </div>

        {!recommendations ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Anexar Foto do Plano</label>
                <div className={cn(
                  "relative h-48 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center transition-all overflow-hidden",
                  photoDataUri ? "border-primary bg-primary/5" : "border-muted-foreground/20 hover:border-primary/50"
                )}>
                  {photoDataUri ? (
                    <>
                      <Image src={photoDataUri} alt="Plano Alimentar" fill className="object-cover opacity-40" />
                      <div className="relative z-10 flex flex-col items-center gap-2">
                        <CheckCircle2 size={32} className="text-primary" />
                        <span className="text-xs font-bold text-primary">FOTO CARREGADA</span>
                        <button onClick={() => setPhotoDataUri(null)} className="text-[10px] font-black text-muted-foreground underline">Remover</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <Upload size={32} className="text-muted-foreground mb-3" />
                      <span className="text-xs font-bold text-muted-foreground text-center px-4">Clique para enviar ou arraste a foto</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="absolute inset-0 opacity-0 cursor-pointer" 
                        onChange={handleFileUpload}
                      />
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Ou descreva em texto</label>
                <Textarea 
                  placeholder="Ex: No almoço preciso de 150g de frango e legumes..." 
                  className="h-48 rounded-3xl bg-muted/30 border-none resize-none p-6 font-medium focus-visible:ring-primary"
                  value={textPlan}
                  onChange={(e) => setTextPlan(e.target.value)}
                />
              </div>
            </div>

            <Button 
              className="w-full h-16 rounded-full text-lg font-black bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 uppercase"
              onClick={handleAnalyze}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="animate-spin" size={20} />
                  ANALISANDO SEU PLANO...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  MONTAR MEU KIT COM IA
                  <ArrowRight size={20} />
                </div>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-8 animate-in zoom-in-95 [animation-duration:500ms]">
            <div className="bg-primary/5 p-6 rounded-[2rem] border border-primary/10">
              <h3 className="font-black text-lg text-primary mb-2 flex items-center gap-2">
                <Sparkles size={20} />
                Sugestões Encontradas
              </h3>
              <p className="text-xs font-medium text-muted-foreground">Com base no seu plano, estes são os pratos que mais combinam com seus objetivos:</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recommendations.map((meal) => (
                <div key={meal.id} className="flex items-center gap-4 p-4 bg-muted/30 rounded-2xl border border-transparent">
                  <div className="relative h-16 w-16 rounded-xl overflow-hidden shrink-0">
                    <Image src={meal.imageUrl} alt={meal.name} fill className="object-cover" />
                  </div>
                  <div>
                    <h4 className="font-black text-xs leading-tight">{meal.name}</h4>
                    <span className="text-[10px] font-bold text-primary uppercase">{meal.category}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <Button 
                variant="outline" 
                className="flex-1 h-16 rounded-full font-black border-muted-foreground/20 hover:bg-muted"
                onClick={() => setRecommendations(null)}
              >
                VOLTAR
              </Button>
              <Button 
                className="flex-[2] h-16 rounded-full text-lg font-black bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20"
                onClick={handleConfirm}
              >
                ADICIONAR KIT À CESTA
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
