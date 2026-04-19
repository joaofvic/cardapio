"use client";

import { useState } from "react";
import { CartItem } from "@/app/types/meal";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Plus, 
  Minus, 
  Trash2, 
  ShoppingBag,
  MapPin,
  CheckCircle2
} from "lucide-react";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface CartSheetProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
}

export function CartSheet({ isOpen, onClose, items, onUpdateQuantity, onRemove }: CartSheetProps) {
  const [isNotHome, setIsNotHome] = useState(false);
  const [locationCaptured, setLocationCaptured] = useState(false);
  const [address, setAddress] = useState({
    street: '',
    number: '',
    neighborhood: '',
    complement: ''
  });

  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const deliveryFee = items.length > 0 ? 9.90 : 0;
  const total = subtotal + deliveryFee;

  const formatCurrency = (value: number) => `R$ ${value.toFixed(2).replace('.', ',')}`;

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLocationCaptured(true);
        // Reset manual fields if we capture GPS
        setAddress(prev => ({ ...prev, street: 'Localização atual capturada' }));
      }, (error) => {
        console.error("Error getting location:", error);
      });
    }
  };

  // Validation logic: 
  // If NOT home, must have street and number.
  // If at home, must have captured GPS location.
  const isLocationValid = isNotHome 
    ? (address.street.trim() !== '' && address.number.trim() !== '' && address.street !== 'Localização atual capturada')
    : locationCaptured;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md bg-white border-l-0 rounded-l-[2rem] flex flex-col p-0">
        <div className="p-6 pb-2">
          <SheetHeader>
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-primary/10 p-2 rounded-xl">
                <ShoppingBag className="text-primary" size={20} />
              </div>
              <SheetTitle className="text-2xl font-black">Sua Cesta</SheetTitle>
            </div>
          </SheetHeader>
        </div>

        <ScrollArea className="flex-grow px-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="text-muted-foreground" size={40} />
              </div>
              <p className="text-lg font-bold text-foreground mb-1">Sua cesta está vazia</p>
              <p className="text-sm text-muted-foreground">Adicione algumas refeições deliciosas para começar!</p>
              <Button 
                variant="outline" 
                className="mt-6 rounded-full border-primary text-primary hover:bg-primary/10"
                onClick={onClose}
              >
                Ver Cardápio
              </Button>
            </div>
          ) : (
            <div className="space-y-6 py-4">
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 group">
                    <div className="relative h-20 w-20 rounded-2xl overflow-hidden shrink-0 shadow-sm">
                      <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex flex-col justify-between flex-grow">
                      <div>
                        <h4 className="font-bold text-foreground leading-tight">{item.name}</h4>
                        <p className="text-primary font-bold text-sm">{formatCurrency(item.price)}</p>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center bg-muted rounded-full p-1 gap-3">
                          <button 
                            onClick={() => onUpdateQuantity(item.id, -1)}
                            className="h-6 w-6 rounded-full bg-white flex items-center justify-center text-foreground hover:bg-primary hover:text-white transition-colors shadow-sm"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="text-xs font-bold min-w-[12px] text-center">{item.quantity}</span>
                          <button 
                            onClick={() => onUpdateQuantity(item.id, 1)}
                            className="h-6 w-6 rounded-full bg-white flex items-center justify-center text-foreground hover:bg-primary hover:text-white transition-colors shadow-sm"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <button 
                          onClick={() => onRemove(item.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-6" />

              {/* Delivery Section */}
              <div className="space-y-4 pb-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-primary/10 p-1.5 rounded-lg">
                    <MapPin className="text-primary" size={18} />
                  </div>
                  <h3 className="font-bold text-lg">Local de Entrega</h3>
                </div>
                
                {/* Priority: Use current location button */}
                {!isNotHome && (
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      type="button"
                      className={cn(
                        "w-full rounded-xl h-12 flex items-center gap-2 font-bold shadow-sm transition-all hover:scale-[1.01]",
                        locationCaptured 
                          ? "bg-primary/10 border-primary text-primary" 
                          : "border-primary text-primary hover:bg-primary/5"
                      )}
                      onClick={handleGetLocation}
                    >
                      {locationCaptured ? <CheckCircle2 size={18} /> : <MapPin size={18} />}
                      {locationCaptured ? "Localização Capturada" : "Usar minha localização atual"}
                    </Button>
                    {locationCaptured && (
                      <p className="text-[10px] text-center text-primary font-bold">Sua localização GPS será usada para a entrega.</p>
                    )}
                  </div>
                )}

                {/* Manual Address Toggle */}
                <div className="flex items-center space-x-2 px-1 pt-2">
                  <Checkbox 
                    id="not-home" 
                    checked={isNotHome} 
                    onCheckedChange={(checked) => {
                      setIsNotHome(!!checked);
                      if (!!checked) {
                        // If switching to manual, clear the "captured" indicator if it was just the string
                        if (address.street === 'Localização atual capturada') {
                          setAddress(prev => ({ ...prev, street: '' }));
                        }
                      }
                    }}
                  />
                  <Label 
                    htmlFor="not-home" 
                    className="text-sm font-bold cursor-pointer select-none text-foreground/80"
                  >
                    Não estou em casa (Informar endereço)
                  </Label>
                </div>

                {/* Conditional Manual Address Fields */}
                {isNotHome && (
                  <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="grid grid-cols-4 gap-3">
                      <div className="col-span-3 space-y-2">
                        <Label htmlFor="street" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Rua / Avenida</Label>
                        <Input 
                          id="street" 
                          placeholder="Nome da rua..." 
                          className="h-12 rounded-xl bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary"
                          value={address.street === 'Localização atual capturada' ? '' : address.street}
                          onChange={(e) => setAddress({...address, street: e.target.value})}
                        />
                      </div>
                      <div className="col-span-1 space-y-2">
                        <Label htmlFor="number" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Nº</Label>
                        <Input 
                          id="number" 
                          placeholder="42" 
                          className="h-12 rounded-xl bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary"
                          value={address.number}
                          onChange={(e) => setAddress({...address, number: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="neighborhood" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Bairro</Label>
                        <Input 
                          id="neighborhood" 
                          placeholder="Ex: Centro" 
                          className="h-12 rounded-xl bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary"
                          value={address.neighborhood}
                          onChange={(e) => setAddress({...address, neighborhood: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="complement" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Complemento</Label>
                        <Input 
                          id="complement" 
                          placeholder="Apto, bloco..." 
                          className="h-12 rounded-xl bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary"
                          value={address.complement}
                          onChange={(e) => setAddress({...address, complement: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </ScrollArea>

        {items.length > 0 && (
          <div className="p-6 bg-muted/30 border-t rounded-t-[2rem]">
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-bold">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Taxa de Entrega</span>
                <span className="font-bold">{formatCurrency(deliveryFee)}</span>
              </div>
              <Separator className="bg-border" />
              <div className="flex justify-between text-lg">
                <span className="font-black">Total</span>
                <span className="font-black text-primary">{formatCurrency(total)}</span>
              </div>
            </div>
            <SheetFooter>
              <Button 
                disabled={!isLocationValid}
                className={cn(
                  "w-full h-14 rounded-full text-lg font-bold shadow-xl transition-all",
                  isLocationValid 
                    ? "bg-primary hover:bg-primary/90 text-white shadow-primary/20 hover:scale-[1.02]" 
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                )}
              >
                Ir para Pagamento
              </Button>
              {!isLocationValid && (
                <p className="text-[10px] text-center w-full mt-2 text-muted-foreground font-medium">
                  Forneça sua localização para continuar
                </p>
              )}
            </SheetFooter>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
