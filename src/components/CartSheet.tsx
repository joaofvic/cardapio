
"use client";

import { useState, useEffect, useRef } from "react";
import { CartItem } from "@/app/types/meal";
import { UserProfile } from "@/app/page";
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
  Wallet,
  Ticket,
  User,
  Phone,
  Loader2,
  ChevronDown,
  Info,
  Calendar,
  Truck
} from "lucide-react";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

interface CartSheetProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  user: UserProfile | null;
  selectedCity: string;
  onIdentify: (user: UserProfile) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
}

type CheckoutStep = 'cart' | 'payment';
type PaymentType = 'online' | 'delivery';

export function CartSheet({ isOpen, onClose, items, user, selectedCity, onIdentify, onUpdateQuantity, onRemove }: CartSheetProps) {
  const [step, setStep] = useState<CheckoutStep>('cart');
  const [paymentType, setPaymentType] = useState<PaymentType>('online');
  const [isNotHome, setIsNotHome] = useState(false);
  const [locationCaptured, setLocationCaptured] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<string>("");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  
  const scrollAreaTopRef = useRef<HTMLDivElement>(null);

  const [phone, setPhone] = useState(user?.phone || "");
  const [name, setName] = useState(user?.name || "");
  const [searching, setSearching] = useState(false);

  const [address, setAddress] = useState({
    street: '',
    number: '',
    neighborhood: '',
    city: selectedCity,
    complement: '',
    reference: ''
  });

  const { toast } = useToast();
  const firestore = useFirestore();

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => setStep('cart'), 300);
    } else {
      setPhone(user?.phone || "");
      setName(user?.name || "");
      if (!user?.address?.city) {
        setAddress(prev => ({ ...prev, city: selectedCity }));
      }
    }
  }, [isOpen, user, selectedCity]);

  useEffect(() => {
    if (user?.address && user.address.street) {
      setAddress({
        street: user.address.street || '',
        number: user.address.number || '',
        neighborhood: user.address.neighborhood || '',
        city: user.address.city || selectedCity,
        complement: user.address.complement || '',
        reference: user.address.reference || ''
      });
      setIsNotHome(true);
    }
  }, [user, isOpen, selectedCity]);

  const scrollToTop = () => {
    if (scrollAreaTopRef.current) {
      scrollAreaTopRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  useEffect(() => {
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length >= 10 && firestore && !user && !searching) {
      const handleLookup = async () => {
        setSearching(true);
        try {
          const docRef = doc(firestore, "users", cleanPhone);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            setName(data.name);
            if (data.address) {
              setAddress({
                street: data.address.street || '',
                number: data.address.number || '',
                neighborhood: data.address.neighborhood || '',
                city: data.address.city || selectedCity,
                complement: data.address.complement || '',
                reference: data.address.reference || ''
              });
            }
          }
        } catch (e) {
          // Silent
        } finally {
          setSearching(false);
        }
      };
      handleLookup();
    }
  }, [phone, firestore, user, selectedCity, searching]);

  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const discountAmount = appliedCoupon === 'ADAS' ? subtotal * 0.5 : 0;
  const deliveryFee = items.length > 0 ? 9.90 : 0;
  const total = subtotal + deliveryFee - discountAmount;

  const formatCurrency = (value: number) => `R$ ${value.toFixed(2).replace('.', ',')}`;

  const handleApplyCoupon = () => {
    if (couponCode.toUpperCase() === 'ADAS') {
      setAppliedCoupon('ADAS');
      toast({
        title: "Cupom Aplicado!",
        description: "Você ganhou 50% de desconto no subtotal.",
      });
    } else {
      setAppliedCoupon("");
      toast({
        variant: "destructive",
        title: "Cupom Inválido",
        description: "O código informado não é válido ou expirou.",
      });
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast({
        variant: "destructive",
        title: "Erro de Localização",
        description: "Seu navegador não suporta geolocalização.",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition((position) => {
      setLocationCaptured(true);
      setAddress(prev => ({ 
        ...prev, 
        street: 'Localização GPS',
        number: 'Referência GPS',
        neighborhood: 'Referência GPS'
      }));
      toast({
        title: "Localização Capturada!",
        description: "Sua posição foi identificada.",
      });
    }, (error) => {
      toast({
        variant: "destructive",
        title: "Erro de Localização",
        description: "Por favor, informe o endereço manualmente.",
      });
    });
  };

  const isFormValid = name.trim().length > 2 && 
                    phone.replace(/\D/g, "").length >= 10 && 
                    (isNotHome ? 
                      (address.street.trim() !== '' && address.number.trim() !== '' && address.neighborhood.trim() !== '') : 
                      (locationCaptured || (address.street.trim() !== '' && address.number.trim() !== ''))
                    );

  const handleNextStep = () => {
    setStep('payment');
    setTimeout(scrollToTop, 100);
  };

  const handleFinalize = async () => {
    if (!firestore) return;

    const cleanPhone = phone.replace(/\D/g, "");
    const userProfile: UserProfile = {
      name,
      phone: cleanPhone,
      address
    };

    const userRef = doc(firestore, "users", cleanPhone);
    setDoc(userRef, userProfile, { merge: true })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: userRef.path,
          operation: 'write',
          requestResourceData: userProfile,
        });
        errorEmitter.emit('permission-error', permissionError);
      });

    onIdentify(userProfile);

    toast({
      title: "Pedido Recebido!",
      description: "Estamos preparando suas delícias.",
    });
    onClose();
  };

  const paymentMethods = [
    { id: 'pix', label: 'PIX (Online)', icon: QrCode, type: 'online' },
    { id: 'card_online', label: 'Cartão de Crédito (App)', icon: CreditCard, type: 'online' },
    { id: 'apple', label: 'Apple Pay', icon: Smartphone, type: 'online' },
    { id: 'google', label: 'Google Pay', icon: Smartphone, type: 'online' },
    { id: 'nupay', label: 'NuPay', icon: Wallet, type: 'online' },
    { id: 'card_machine', label: 'Cartão na Maquininha', icon: CreditCard, type: 'delivery' },
    { id: 'cash', label: 'Dinheiro (na entrega)', icon: Banknote, type: 'delivery' },
  ];

  const filteredMethods = paymentMethods.filter(m => m.type === paymentType);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md bg-white border-l-0 rounded-l-[2.5rem] flex flex-col p-0 overflow-hidden shadow-2xl animate-in slide-in-from-right duration-[3000ms] ease-in-out">
        <div className="p-6 pb-2 shrink-0">
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

        <ScrollArea className="flex-grow">
          <div className="px-6 pb-20">
            <div ref={scrollAreaTopRef} className="h-0 w-0" />
            
            {selectedCity !== "São Miguel - RN" && (
              <div className="mb-6 bg-amber-50 border border-amber-200 p-4 rounded-2xl flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-[3000ms] ease-in-out">
                <div className="flex gap-2">
                  <Info className="text-amber-600 shrink-0" size={16} />
                  <p className="text-[11px] font-bold text-amber-900 leading-tight">
                    Aviso: Para <span className="font-black">{selectedCity}</span>, realizamos rotas de entrega semanais.
                  </p>
                </div>
                <div className="space-y-1 pl-6">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={12} className="text-amber-700" />
                    <span className="text-[10px] font-black text-amber-900 uppercase">Pedidos aceitos até Quinta, 16/12</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Truck size={12} className="text-amber-700" />
                    <span className="text-[10px] font-black text-amber-900 uppercase">Próxima entrega: Sáb, 18/12</span>
                  </div>
                </div>
              </div>
            )}

            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                  <ShoppingBag className="text-muted-foreground" size={40} />
                </div>
                <p className="text-lg font-bold text-foreground mb-1">Sua cesta está vazia</p>
                <Button 
                  variant="outline" 
                  className="mt-6 rounded-full border-primary text-primary hover:bg-primary/10"
                  onClick={onClose}
                >
                  Ver Cardápio
                </Button>
              </div>
            ) : step === 'cart' ? (
              <div className="space-y-8 animate-in fade-in duration-[3000ms] ease-in-out">
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4 group">
                      <div className="relative h-20 w-20 rounded-2xl overflow-hidden shrink-0 shadow-sm border border-border/40">
                        <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="flex flex-col justify-between flex-grow py-0.5">
                        <div>
                          <h4 className="font-bold text-foreground leading-tight text-sm">{item.name}</h4>
                          <p className="text-primary font-black text-xs mt-1">{formatCurrency(item.price)}</p>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center bg-muted/50 rounded-full p-0.5 gap-3 border border-border/20">
                            <button onClick={() => onUpdateQuantity(item.id, -1)} className="h-7 w-7 rounded-full bg-white flex items-center justify-center shadow-sm hover:bg-primary hover:text-white transition-colors active:scale-90"><Minus size={12} /></button>
                            <span className="text-xs font-black w-4 text-center">{item.quantity}</span>
                            <button onClick={() => onUpdateQuantity(item.id, 1)} className="h-7 w-7 rounded-full bg-white flex items-center justify-center shadow-sm hover:bg-primary hover:text-white transition-colors active:scale-90"><Plus size={12} /></button>
                          </div>
                          <button onClick={() => onRemove(item.id)} className="text-muted-foreground hover:text-destructive transition-colors p-2"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="opacity-50" />

                <div className="space-y-5">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="bg-primary/10 p-1.5 rounded-lg"><User className="text-primary" size={16} /></div>
                    <h3 className="font-black text-sm uppercase tracking-wider">Seus Dados</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Telefone (WhatsApp)</Label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                        <Input 
                          placeholder="(00) 00000-0000" 
                          className="h-12 pl-11 rounded-xl bg-muted/30 border-none font-bold focus-visible:ring-primary" 
                          value={phone} 
                          onChange={(e) => setPhone(e.target.value)}
                          type="tel"
                        />
                        {searching && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-primary" size={16} />}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Seu Nome</Label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                        <Input 
                          placeholder="Como podemos te chamar?" 
                          className="h-12 pl-11 rounded-xl bg-muted/30 border-none font-bold focus-visible:ring-primary" 
                          value={name} 
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="opacity-50" />

                <div className="space-y-5">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="bg-primary/10 p-1.5 rounded-lg"><MapPin className="text-primary" size={16} /></div>
                    <h3 className="font-black text-sm uppercase tracking-wider">Local de Entrega</h3>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className={cn(
                      "w-full rounded-2xl h-14 flex items-center justify-center gap-3 font-black transition-all border-2",
                      locationCaptured ? "bg-primary/5 border-primary text-primary" : "border-muted-foreground/20 text-foreground hover:border-primary/50"
                    )}
                    onClick={handleGetLocation}
                  >
                    <MapPin size={18} />
                    {locationCaptured ? "LOCALIZAÇÃO CAPTURADA" : "USAR MINHA LOCALIZAÇÃO"}
                  </Button>

                  <div className="flex items-center space-x-2 px-1">
                    <Checkbox id="not-home" checked={isNotHome} onCheckedChange={(c) => setIsNotHome(!!c)} className="rounded-md h-5 w-5" />
                    <Label htmlFor="not-home" className="text-sm font-bold cursor-pointer text-muted-foreground hover:text-foreground">Não estou em casa (Informar endereço)</Label>
                  </div>

                  {isNotHome && (
                    <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2 duration-[3000ms] ease-out">
                      <div className="grid grid-cols-4 gap-3">
                        <div className="col-span-3 space-y-1.5">
                          <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Rua / Avenida</Label>
                          <Input 
                            placeholder="Nome da rua..." 
                            className="h-12 rounded-xl bg-muted/30 border-none focus-visible:ring-primary" 
                            value={address.street} 
                            onChange={(e) => setAddress({...address, street: e.target.value})}
                          />
                        </div>
                        <div className="col-span-1 space-y-1.5">
                          <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Nº <span className="text-primary">*</span></Label>
                          <Input 
                            placeholder="42" 
                            className="h-12 rounded-xl bg-muted/30 border-none focus-visible:ring-primary text-center" 
                            value={address.number} 
                            onChange={(e) => setAddress({...address, number: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Bairro <span className="text-primary">*</span></Label>
                          <Input placeholder="Seu bairro..." className="h-12 rounded-xl bg-muted/30 border-none focus-visible:ring-primary" value={address.neighborhood} onChange={(e) => setAddress({...address, neighborhood: e.target.value})} />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Ponto de Referência</Label>
                        <Input placeholder="Próximo a..." className="h-12 rounded-xl bg-muted/30 border-none focus-visible:ring-primary" value={address.reference} onChange={(e) => setAddress({...address, reference: e.target.value})} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Resumo Detalhado na Rolagem */}
                <div className="pt-4 space-y-6 animate-in slide-in-from-bottom-10 duration-[3000ms] fill-mode-both ease-out">
                  <div className="bg-muted/30 p-5 rounded-[2rem] space-y-3 border border-border/10">
                    <div className="flex justify-between text-xs font-bold text-muted-foreground">
                      <span>Subtotal</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-xs font-bold text-primary">
                        <span>Desconto Especial (Cupom)</span>
                        <span>-{formatCurrency(discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xs font-bold text-muted-foreground">
                      <span>Taxa de Entrega</span>
                      <span>{formatCurrency(deliveryFee)}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-1 px-1">
                      <div className="bg-primary/10 p-1.5 rounded-lg"><Ticket className="text-primary" size={14} /></div>
                      <h3 className="font-black text-[10px] uppercase tracking-wider">Cupom de Desconto</h3>
                    </div>
                    <div className="relative">
                      <Input placeholder="Código do cupom" className="h-12 rounded-xl bg-white border-none font-bold uppercase focus-visible:ring-primary pr-24 shadow-sm" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} />
                      <button onClick={handleApplyCoupon} className="absolute right-1.5 top-1.5 bg-primary text-white h-9 px-4 rounded-lg text-[10px] font-black uppercase transition-transform active:scale-95">Aplicar</button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-in slide-in-from-right duration-[3000ms] ease-in-out">
                <div className="bg-primary/5 p-5 rounded-3xl border border-primary/10 text-center">
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Total a Pagar</p>
                  <p className="text-4xl font-black text-foreground">{formatCurrency(total)}</p>
                </div>

                <div className="space-y-4">
                  <h3 className="font-black text-lg">Método de Pagamento</h3>
                  <div className="flex p-1 bg-muted/50 rounded-2xl border border-border/20">
                    <button onClick={() => {setPaymentType('online'); setSelectedPayment("")}} className={cn("flex-1 py-3 rounded-xl text-xs font-black uppercase transition-all", paymentType === 'online' ? "bg-white text-primary shadow-sm" : "text-muted-foreground")}>Pagar Online</button>
                    <button onClick={() => {setPaymentType('delivery'); setSelectedPayment("")}} className={cn("flex-1 py-3 rounded-xl text-xs font-black uppercase transition-all", paymentType === 'delivery' ? "bg-white text-primary shadow-sm" : "text-muted-foreground")}>Na Entrega</button>
                  </div>
                </div>

                <div className="animate-in fade-in slide-in-from-right-10 duration-[3000ms] fill-mode-both ease-in-out" key={paymentType}>
                  <RadioGroup value={selectedPayment} onValueChange={setSelectedPayment} className="grid gap-3">
                    {filteredMethods.map((method) => (
                      <Label key={method.id} htmlFor={method.id} className={cn("flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer group", selectedPayment === method.id ? "border-primary bg-primary/5" : "border-muted-foreground/10 hover:border-primary/30")}>
                        <div className="flex items-center gap-3">
                          <div className={cn("p-2 rounded-xl transition-colors", selectedPayment === method.id ? "bg-primary text-white" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary")}><method.icon size={20} /></div>
                          <span className="font-bold text-sm">{method.label}</span>
                        </div>
                        <RadioGroupItem value={method.id} id={method.id} className="sr-only" />
                        {selectedPayment === method.id && <CheckCircle2 className="text-primary" size={20} />}
                      </Label>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Rodapé Fixo "Rise-up" */}
        {items.length > 0 && (
          <div className="p-6 bg-white border-t rounded-t-[2.5rem] shadow-[0_-10px_30px_rgba(0,0,0,0.1)] shrink-0 animate-in slide-in-from-bottom duration-[3000ms] ease-in-out">
            <div className="flex items-end justify-between mb-6 px-1">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total do Pedido</span>
                <span className="text-3xl font-black text-primary leading-none mt-1">{formatCurrency(total)}</span>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">{items.length} {items.length === 1 ? 'item' : 'itens'}</span>
                <ChevronDown className="text-muted-foreground animate-bounce" size={14} />
              </div>
            </div>
            
            <SheetFooter>
              {step === 'cart' ? (
                <Button 
                  disabled={!isFormValid} 
                  onClick={handleNextStep} 
                  className="w-full h-16 rounded-full text-lg font-black bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 transition-all active:scale-[0.98] uppercase tracking-tighter"
                >
                  Ir para Pagamento
                </Button>
              ) : (
                <Button 
                  disabled={!selectedPayment} 
                  onClick={handleFinalize} 
                  className="w-full h-16 rounded-full text-lg font-black bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 transition-all active:scale-[0.98] uppercase tracking-tighter"
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
