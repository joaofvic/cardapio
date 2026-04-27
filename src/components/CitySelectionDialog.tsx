
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin, ChevronRight, Info, Calendar, Truck } from "lucide-react";
import { cn } from "@/lib/utils";

const CITIES = [
  "São Miguel - RN",
  "Coronel João Pessoa - RN",
  "Dr. Severiano - RN",
  "Encanto - RN",
  "Pau dos Ferros - RN",
  "Ereré - CE",
  "Pereiro - CE"
];

interface CitySelectionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCitySelect: (city: string) => void;
}

export function CitySelectionDialog({ isOpen, onOpenChange, onCitySelect }: CitySelectionDialogProps) {
  const [selectedTemp, setSelectedTemp] = useState<string | null>(null);

  useEffect(() => {
    const savedCity = localStorage.getItem("harvest_bites_city");
    if (!savedCity && isOpen === false) {
      onOpenChange(true);
    }
  }, [onOpenChange, isOpen]);

  const handleSelect = (city: string) => {
    if (city === "São Miguel - RN") {
      onCitySelect(city);
      setSelectedTemp(null);
    } else {
      setSelectedTemp(city);
    }
  };

  const confirmSelection = () => {
    if (selectedTemp) {
      onCitySelect(selectedTemp);
      setSelectedTemp(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open && !localStorage.getItem("harvest_bites_city")) return;
      onOpenChange(open);
      setSelectedTemp(null);
    }}>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-none rounded-[2rem] bg-white shadow-2xl animate-in zoom-in duration-500 ease-out">
        <div className="bg-primary p-10 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12" />
          
          <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md animate-in zoom-in duration-500 ease-out">
            <MapPin className="text-white" size={32} />
          </div>
          <DialogTitle className="text-2xl font-black text-white mb-2 tracking-tighter">Em qual cidade você está?</DialogTitle>
          <DialogDescription className="text-white/80 font-medium">
            Selecione sua cidade para ver as opções disponíveis na sua região.
          </DialogDescription>
        </div>

        <div className="p-6">
          {!selectedTemp ? (
            <div className="grid grid-cols-1 gap-2 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
              {CITIES.map((city) => (
                <button
                  key={city}
                  onClick={() => handleSelect(city)}
                  className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 hover:bg-primary/10 hover:text-primary transition-all group border border-transparent hover:border-primary/20 text-left"
                >
                  <span className="font-bold">{city}</span>
                  <ChevronRight size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
                </button>
              ))}
            </div>
          ) : (
            <div className="py-4 animate-in zoom-in-95 fade-in duration-500 ease-out">
              <div className="bg-amber-50 border border-amber-200 p-6 rounded-[2rem] mb-6 flex flex-col items-center text-center shadow-inner animate-in slide-in-from-top-4 duration-500 ease-out">
                <div className="bg-amber-100 p-3 rounded-full mb-4 animate-bounce">
                  <Info className="text-amber-600" size={28} />
                </div>
                <h4 className="font-black text-amber-900 mb-2 uppercase tracking-tighter">Aviso de Entrega</h4>
                <div className="text-sm text-amber-800 font-medium leading-relaxed px-2 space-y-4">
                  <p>
                    Para <span className="font-black">{selectedTemp}</span>, realizamos rotas de entrega dos produtos nas respectivas datas das rotas semanais.
                  </p>
                  <div className="flex flex-col gap-2 items-center">
                    <div className="bg-white/50 py-2 px-4 rounded-xl border border-amber-200 inline-flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-150 fill-mode-both">
                      <Calendar size={14} className="text-amber-700" />
                      <span className="font-black text-amber-900 uppercase text-[11px]">Pedidos aceitos até Quinta, 16/12</span>
                    </div>
                    <div className="bg-white/50 py-2 px-4 rounded-xl border border-amber-200 inline-flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-300 fill-mode-both">
                      <Truck size={14} className="text-amber-700" />
                      <span className="font-black text-amber-900 uppercase text-[11px]">Próxima entrega: Sáb, 18/12</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1 h-14 rounded-full font-bold border-muted-foreground/20 hover:bg-muted"
                  onClick={() => setSelectedTemp(null)}
                >
                  Voltar
                </Button>
                <Button 
                  className="flex-1 h-14 rounded-full font-black bg-primary text-white shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
                  onClick={confirmSelection}
                >
                  Continuar
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
