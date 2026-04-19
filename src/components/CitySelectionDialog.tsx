
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
import { MapPin, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const CITIES = [
  "São Paulo",
  "Rio de Janeiro",
  "Belo Horizonte",
  "Curitiba",
  "Porto Alegre",
  "Brasília",
  "Salvador",
  "Fortaleza"
];

interface CitySelectionDialogProps {
  onCitySelect: (city: string) => void;
}

export function CitySelectionDialog({ onCitySelect }: CitySelectionDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const savedCity = localStorage.getItem("harvest_bites_city");
    if (!savedCity) {
      setIsOpen(true);
    }
  }, []);

  const handleSelect = (city: string) => {
    localStorage.setItem("harvest_bites_city", city);
    onCitySelect(city);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-none rounded-[2rem] bg-white">
        <div className="bg-primary p-10 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12" />
          
          <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
            <MapPin className="text-white" size={32} />
          </div>
          <DialogTitle className="text-2xl font-black text-white mb-2">Bem-vindo ao Harvest Bites!</DialogTitle>
          <DialogDescription className="text-white/80 font-medium">
            Selecione sua cidade para ver as opções disponíveis na sua região.
          </DialogDescription>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {CITIES.map((city) => (
              <button
                key={city}
                onClick={() => handleSelect(city)}
                className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 hover:bg-primary/10 hover:text-primary transition-all group border border-transparent hover:border-primary/20"
              >
                <span className="font-bold">{city}</span>
                <ChevronRight size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
