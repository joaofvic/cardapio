"use client";

import { useState, useEffect } from "react";
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
  CheckCircle2,
  ArrowLeft,
  CreditCard,
  Banknote,
  Smartphone,
  QrCode,
  Wallet
} from "lucide-react";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

interface CartSheetProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
}

type CheckoutStep = 'cart' | 'payment';

export function CartSheet({ isOpen, onClose, items, onUpdateQuantity, onRemove }: CartSheetProps) {
  const [step, setStep] = useState<CheckoutStep>('cart');
  const [isNotHome, setIsNotHome] = useState(false);
  const [locationCaptured, setLocationCaptured] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<string>("");
  const [address, setAddress] = useState({
    street: '',
    number: '',
    neighborhood: '',
    complement: ''
  });

  // Reset step when opening/closing
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => setStep('cart'), 300);
    }
  }, [isOpen]);

  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const deliveryFee = items.length > 0 ? 9.90 : 0;
  const total = subtotal + deliveryFee;

  const formatCurrency = (value: number) => `R$ ${value.toFixed(2).replace('.', ',')}`;

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLocationCaptured(true);
        setAddress(prev => ({ ...prev, street: 'Localização atual capturada' }));
      }, (error) => {
        console.error("Error getting location:", error);
      });
    }
  };

  const isLocationValid = isNotHome 
    ? (address.street.trim() !== '' && address.number.trim() !== '' && address.street !== 'Localização atual capturada')
    : locationCaptured;

  const paymentMethods = [
    { id: 'pix', label: 'PIX', icon: QrCode },
    { id: 'card', label: 'Cartão', icon: CreditCard },
    { id: 'cash', label: 'Dinheiro', icon: Banknote },
    { id: 'apple', label: 'Apple Pay', icon: Smartphone },
    { id: 'nupay', label: 'NuPay', icon: Wallet },
    { id: 'google', label: 'Google Pay', icon: Smartphone },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md bg-white border-l-0 rounded-l-[2rem] flex flex-col p-0 overflow-hidden">
        
        {/* Header - Changes based on step */}
        <div className="p-6 pb-2">
          <SheetHeader>
            <div className="flex items-center gap-2 mb-2">
              {step === 'payment' && (
                <button 
                  onClick={() => setStep('cart')}
                  className="p-2 hover:bg-muted rounded-full transition-colors -ml-2"
                >
                  <ArrowLeft size={20} />
                </button>
              )}
              <div className="bg-primary/10 p-2 rounded-xl">
                {step === 'cart' ? <ShoppingBag className="text-primary" size={20} /> : <CreditCard className="text-primary" size={20} />}
              </div>
              <SheetTitle className="text-2xl font-black">
                {step === 'cart' ? 'Sua Cesta' : 'Pagamento'}
              </SheetTitle>
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
          ) : step === 'cart' ? (
            <div className="space-y-6 py-4">
              {/* Item List */}
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
                  </div>
                )}

                <div className="flex items-center space-x-2 px-1 pt-2">
                  <Checkbox 
                    id="not-home" 
                    checked={isNotHome} 
                    onCheckedChange={(checked) => {
                      setIsNotHome(!!checked);
                      if (!!checked && address.street === 'Localização atual capturada') {
                        setAddress(prev => ({ ...prev, street: '' }));
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

                {isNotHome && (
                  <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="grid grid-cols-4 gap-3">
                      <div className="col-span-3 space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Rua / Avenida</Label>
                        <Input 
                          placeholder="Nome da rua..." 
                          className="h-12 rounded-xl bg-muted/30 border-none"
                          value={address.street === 'Localização atual capturada' ? '' : address.street}
                          onChange={(e) => setAddress({...address, street: e.target.value})}
                        />
                      </div>
                      <div className="col-span-1 space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Nº</Label>
                        <Input 
                          placeholder="42" 
                          className="h-12 rounded-xl bg-muted/30 border-none"
                          value={address.number}
                          onChange={(e) => setAddress({...address, number: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Step: Payment Selection */
            <div className="py-4 space-y-6 animate-in slide-in-from-right duration-300">
              <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
                <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Resumo</p>
                <p className="text-sm text-muted-foreground">O total do seu pedido é <span className="text-foreground font-black">{formatCurrency(total)}</span></p>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-lg">Escolha como pagar</h3>
                <RadioGroup 
                  value={selectedPayment} 
                  onValueChange={setSelectedPayment}
                  className="grid grid-cols-1 gap-3"
                >
                  {paymentMethods.map((method) => (
                    <Label
                      key={method.id}
                      htmlFor={method.id}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer",
                        selectedPayment === method.id 
                          ? "border-primary bg-primary/5 shadow-sm" 
                          : "border-muted bg-white hover:border-primary/30"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-2 rounded-xl",
                          selectedPayment === method.id ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                        )}>
                          <method.icon size={20} />
                        </div>
                        <span className="font-bold">{method.label}</span>
                      </div>
                      <RadioGroupItem value={method.id} id={method.id} className="sr-only" />
                      {selectedPayment === method.id && <CheckCircle2 size={20} className="text-primary" />}
                    </Label>
                  ))}
                </RadioGroup>
              </div>
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
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
              {step === 'cart' ? (
                <div className="w-full">
                  <Button 
                    disabled={!isLocationValid}
                    onClick={() => setStep('payment')}
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
                    <p className="text-[10px] text-center w-full mt-2 text-muted-foreground font-medium uppercase tracking-widest">
                      Forneça sua localização para continuar
                    </p>
                  )}
                </div>
              ) : (
                <Button 
                  disabled={!selectedPayment}
                  className={cn(
                    "w-full h-14 rounded-full text-lg font-bold shadow-xl transition-all",
                    selectedPayment 
                      ? "bg-primary hover:bg-primary/90 text-white shadow-primary/20 hover:scale-[1.02]" 
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  )}
                >
                  Finalizar Pedido
                </Button>
              )}
            </SheetFooter>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
