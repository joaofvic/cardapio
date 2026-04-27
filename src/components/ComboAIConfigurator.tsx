
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Meal } from "@/app/types/meal";
import { MEALS } from "@/app/data/meals";
import { Upload, FileText, Sparkles, Loader2, CheckCircle2, ArrowRight, Heart } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { analyzeMealPlan } from "@/ai/flows/analyze-meal-plan-flow";
import { UserProfile } from "@/app/page";
import { useFirestore } from "@/firebase";
import { doc, setDoc } from "firebase/firestore";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

interface ComboAIConfiguratorProps {
  onAddToCart: (combo: Meal) => void;
  user: UserProfile | null;
  onIdentifyRequired: () => void;
}

export function ComboAIConfigurator({ onAddToCart, user, onIdentifyRequired }: ComboAIConfiguratorProps) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [textPlan, setTextPlan] = useState("");
  const [photoDataUri, setPhotoDataUri] = useState<string | null>(null);
  const { toast } = useToast();
  const firestore = useFirestore();

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

    if (!user) {
      onIdentifyRequired();
      toast({
        title: "Identificação Necessária",
        description: "Por favor, informe seus dados para que possamos entrar em contato.",
      });
      return;
    }

    setLoading(true);
    try {
      // 1. Salva o Lead no Firestore para controle do Admin
      if (firestore) {
        const leadId = `LEAD-${Date.now()}`;
        const leadRef = doc(firestore, "leads", leadId);
        const leadData = {
          userId: user.phone,
          customerName: user.name,
          textPlan,
          photoDataUri: photoDataUri || null,
          status: 'pending',
          createdAt: new Date().toISOString()
        };

        setDoc(leadRef, leadData)
          .catch(async (error) => {
            const permissionError = new FirestorePermissionError({
              path: leadRef.path,
              operation: 'create',
              requestResourceData: leadData,
            });
            errorEmitter.emit('permission-error', permissionError);
          });
      }

      // 2. Chama a IA (Análise opcional já que o foco é o contato humano)
      await analyzeMealPlan({
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
    } catch (error) {
      console.error("AI analysis error (handled as lead):", error);
    } finally {
      setSubmitted(true);
      setLoading(false);
      toast({
        title: "Plano Recebido!",
        description: "Recebemos suas informações com sucesso.",
      });
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 animate-in zoom-in-95 duration-500 ease-out">
        <div className="bg-white rounded-[3rem] p-10 md:p-16 shadow-2xl border border-primary/10 text-center relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-secondary/10 rounded-full" />
          
          <div className="bg-primary/10 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-bounce">
            <CheckCircle2 className="text-primary" size={48} />
          </div>

          <h2 className="text-3xl font-black tracking-tighter text-foreground mb-6 leading-none">
            Recebemos seu plano! 🥗
          </h2>
          
          <div className="space-y-6 relative z-10 text-left">
            <p className="text-lg font-medium text-muted-foreground leading-relaxed text-center">
              Tudo certo, {user?.name.split(' ')[0]}!
            </p>
            <div className="bg-muted/30 p-8 rounded-[2rem] border border-border/50 space-y-4">
              <p className="text-base font-bold text-foreground leading-relaxed">
                Um de nossos especialistas entrará em contato com você em breve para te passar o <span className="text-primary font-black">orçamento personalizado</span> do seu plano e explicar exatamente como funciona nosso serviço de marmitas gourmet.
              </p>
              <p className="text-base font-bold text-foreground leading-relaxed">
                Transformaremos sua dieta em refeições práticas, nutritivas e deliciosas!
              </p>
            </div>
            <p className="text-sm font-bold text-primary flex items-center justify-center gap-2 uppercase tracking-widest pt-4">
              Agradecemos por escolher o Harvest Bites! <Heart size={16} className="fill-primary" />
            </p>
          </div>

          <Button 
            variant="outline"
            className="mt-12 w-full h-16 rounded-full font-black border-muted-foreground/20 hover:bg-muted text-primary uppercase"
            onClick={() => window.location.reload()}
          >
            VOLTAR AO CARDÁPIO
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-border/40">
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-primary/10 p-4 rounded-3xl">
            <Sparkles className="text-primary" size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-black tracking-tighter text-foreground leading-none uppercase">Sua Dieta na Prática</h2>
            <p className="text-muted-foreground font-medium mt-2">Envie seu plano alimentar e deixe o resto com a gente.</p>
          </div>
        </div>

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
                      <span className="text-xs font-bold text-primary uppercase">FOTO CARREGADA</span>
                      <button onClick={() => setPhotoDataUri(null)} className="text-[10px] font-black text-muted-foreground underline uppercase">Remover</button>
                    </div>
                  </>
                ) : (
                  <>
                    <Upload size={32} className="text-muted-foreground mb-3" />
                    <span className="text-xs font-bold text-muted-foreground text-center px-4 uppercase">Enviar Foto do Plano</span>
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
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Restrições ou Detalhes</label>
              <Textarea 
                placeholder="Descreva aqui se possui alguma restrição como leite, lactose ou outras preferências..." 
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
                ENVIANDO...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                ENVIAR PLANO
                <ArrowRight size={20} />
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
