
"use client";

import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from "@/components/ui/dialog";
import { Utensils, Sparkles, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ComboTypeSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectManual: () => void;
  onSelectAI: () => void;
}

export function ComboTypeSelectionDialog({ isOpen, onClose, onSelectManual, onSelectAI }: ComboTypeSelectionDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-none rounded-[2.5rem] bg-white shadow-2xl animate-in zoom-in duration-[3000ms] ease-in-out">
        <div className="bg-primary p-10 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
          <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
            <Utensils className="text-white" size={32} />
          </div>
          <DialogTitle className="text-2xl font-black text-white mb-2 tracking-tighter">Escolha seu Estilo</DialogTitle>
          <DialogDescription className="text-white/80 font-medium">
            Como você prefere montar seu kit de 5 refeições?
          </DialogDescription>
        </div>

        <div className="p-6 space-y-4">
          <button
            onClick={() => {
              onSelectManual();
              onClose();
            }}
            className="w-full flex items-center justify-between p-6 rounded-[2rem] bg-muted/30 hover:bg-primary/10 hover:text-primary transition-all group border-2 border-transparent hover:border-primary/20 text-left animate-in slide-in-from-bottom-4 duration-[3000ms] ease-out"
          >
            <div className="flex items-center gap-4">
              <div className="bg-white p-3 rounded-2xl shadow-sm group-hover:bg-primary group-hover:text-white transition-colors">
                <Utensils size={24} />
              </div>
              <div>
                <h4 className="font-black text-foreground group-hover:text-primary uppercase text-xs tracking-widest">Montar Manualmente</h4>
                <p className="text-[11px] font-medium text-muted-foreground mt-1">Eu escolho cada um dos 5 pratos</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />
          </button>

          <button
            onClick={() => {
              onSelectAI();
              onClose();
            }}
            className="w-full flex items-center justify-between p-6 rounded-[2rem] bg-primary/5 hover:bg-primary/10 transition-all group border-2 border-primary/10 hover:border-primary/30 text-left animate-in slide-in-from-bottom-4 duration-[3000ms] delay-300 fill-mode-both ease-out"
          >
            <div className="flex items-center gap-4">
              <div className="bg-secondary p-3 rounded-2xl shadow-sm text-secondary-foreground group-hover:scale-110 transition-transform">
                <Sparkles size={24} />
              </div>
              <div>
                <h4 className="font-black text-primary uppercase text-xs tracking-widest flex items-center gap-2">
                  Plano Alimentar AI
                  <span className="bg-primary text-white text-[8px] px-2 py-0.5 rounded-full font-black">NOVO</span>
                </h4>
                <p className="text-[11px] font-medium text-muted-foreground mt-1">Sugestão baseada nos seus objetivos</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-primary transition-colors" />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
