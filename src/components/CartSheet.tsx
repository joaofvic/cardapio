
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
  Loader2
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

interface CartSheetProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  user: UserProfile | null;
  onIdentify: (user: UserProfile) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
}

type CheckoutStep = 'cart' | 'payment';
type PaymentType = 'online' | 'delivery';

export function CartSheet({ isOpen, onClose, items, user, onIdentify, onUpdateQuantity, onRemove }: CartSheetProps) {
  const [step, setStep] = useState<CheckoutStep>('cart');
  const [paymentType, setPaymentType] = useState<PaymentType>('online');
  const [isNotHome, setIsNotHome] = useState(false);
  const [locationCaptured, setLocationCaptured] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<string>("");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  
  // Ref to scroll to top when changing steps
  const scrollAreaTopRef = useRef<HTMLDivElement>(null);

  // User identification states
  const [phone, setPhone] = useState(user?.phone || "");
  const [name, setName] = useState(user?.name || "");
  const [searching, setSearching] = useState(false);

  const [address, setAddress] = useState({
    street: '',
    number: '',
    neighborhood: '',
    city: 'São Miguel - RN',
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
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (user?.address && user.address.street) {
      setAddress({
        street: user.address.street || '',
        number: user.address.number || '',
        neighborhood: user.address.neighborhood || '',
        city: user.address.city || 'São Miguel - RN',
        complement: user.address.complement || '',
        reference: user.address.reference || ''
      });
      setIsNotHome(true);
    }
  }, [user, isOpen]);

  // Scroll to top when step changes
  useEffect(() => {
    if (scrollAreaTopRef.current) {
      scrollAreaTopRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [step]);

  // Auto-lookup logic
  useEffect(() => {
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length >= 10 && firestore && !user) {
      const handleLookup = async () => {
        if (searching) return;
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
                city: data.address.city || 'São Miguel - RN',
                complement: data.address.complement || '',
                reference: data.address.reference || ''
              });
            }
          }
        } catch (e) {
          // Silent per guidelines
        } finally {
          setSearching(false);
        }
      };
      handleLookup();
    }
  }, [phone, firestore, user, searching]);

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
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLocationCaptured(true);
        if (!isNotHome) {
          setAddress(prev => ({ ...prev, street: 'Localização atual capturada' }));
        }
      }, (error) => {
        // Silent per guidelines
      });
    }
  };

  const isFormValid = name.trim().length > 2 && phone.replace(/\D/g, "").length >= 10 && (
    isNotHome 
      ? (address.street.trim() !== '' && address.number.trim() !== '' && address.neighborhood.trim() !== '')
      : locationCaptured
  );

  const handleFinalize = async () => {
    if (!firestore) return;

    const cleanPhone = phone.replace(/\D/g, "");
    const userProfile: UserProfile = {
      name,
      phone: cleanPhone,
      address
    };

    // Save/Update user profile
    const userRef = doc(firestore, "users", cleanPhone);
    setDoc(userRef, userProfile, { merge: true })
      .catch((error) => {
        // Handled centrally
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
      <SheetContent className="w-full sm:max-w-md bg-white border-l-0 rounded-l-[2rem] flex flex-col p-0 overflow-hidden">
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
          <div ref={scrollAreaTopRef} className="h-0 w-0" />
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
            <div className="space-y-6 py-4 animate-in fade-in duration-300">
              {/* Items List */}
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
                          <button onClick={() => onUpdateQuantity(item.id, -1)} className="h-6 w-6 rounded-full bg-white flex items-center justify-center shadow-sm hover:bg-primary hover:text-white"><Minus size={14} /></button>
                          <span className="text-xs font-bold">{item.quantity}</span>
                          <button onClick={() => onUpdateQuantity(item.id, 1)} className="h-6 w-6 rounded-full bg-white flex items-center justify-center shadow-sm hover:bg-primary hover:text-white"><Plus size={14} /></button>
                        </div>
                        <button onClick={() => onRemove(item.id)} className="text-muted-foreground hover:text-destructive"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Identification Integrated */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-primary/10 p-1.5 rounded-lg"><User className="text-primary" size={18} /></div>
                  <h3 className="font-bold text-lg">Seus Dados</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Telefone (WhatsApp)</Label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                      <Input 
                        placeholder="(00) 00000-0000" 
                        className="h-12 pl-11 rounded-xl bg-muted/30 border-none font-bold" 
                        value={phone} 
                        onChange={(e) => setPhone(e.target.value)}
                        type="tel"
                      />
                      {searching && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-primary" size={16} />}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Seu Nome</Label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                      <Input 
                        placeholder="Como podemos te chamar?" 
                        className="h-12 pl-11 rounded-xl bg-muted/30 border-none font-bold" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Delivery Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-primary/10 p-1.5 rounded-lg"><MapPin className="text-primary" size={18} /></div>
                  <h3 className="font-bold text-lg">Local de Entrega</h3>
                </div>
                
                <Button 
                  variant="outline" 
                  className={cn("w-full rounded-xl h-12 flex items-center gap-2 font-bold", locationCaptured ? "bg-primary/10 border-primary text-primary" : "border-primary text-primary")}
                  onClick={handleGetLocation}
                >
                  <MapPin size={18} />
                  {locationCaptured ? "Localização Capturada" : "Usar minha localização atual"}
                </Button>

                <div className="flex items-center space-x-2 px-1">
                  <Checkbox id="not-home" checked={isNotHome} onCheckedChange={(c) => setIsNotHome(!!c)} />
                  <Label htmlFor="not-home" className="text-sm font-bold cursor-pointer">Não estou em casa (Informar endereço)</Label>
                </div>

                {isNotHome && (
                  <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="grid grid-cols-4 gap-3">
                      <div className="col-span-3 space-y-1">
                        <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Rua / Avenida</Label>
                        <Input placeholder="Nome da rua..." className="h-12 rounded-xl bg-muted/30 border-none" value={address.street} onChange={(e) => setAddress({...address, street: e.target.value})} />
                      </div>
                      <div className="col-span-1 space-y-1">
                        <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Nº</Label>
                        <Input 
                          placeholder="42" 
                          className="h-12 rounded-xl bg-muted/30 border-none" 
                          value={address.number} 
                          onChange={(e) => setAddress({...address, number: e.target.value.replace(/\D/g, "")})}
                          inputMode="numeric"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Bairro</Label>
                        <Input placeholder="Seu bairro..." className="h-12 rounded-xl bg-muted/30 border-none" value={address.neighborhood} onChange={(e) => setAddress({...address, neighborhood: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Cidade</Label>
                        <Input value="São Miguel - RN" disabled className="h-12 rounded-xl bg-muted/10 border-none font-bold" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Ponto de Referência</Label>
                      <Input 
                        placeholder="Ex: Próximo ao mercado..." 
                        className="h-12 rounded-xl bg-muted/30 border-none" 
                        value={address.reference} 
                        onChange={(e) => setAddress({...address, reference: e.target.value})} 
                      />
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Coupon Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-primary/10 p-1.5 rounded-lg"><Ticket className="text-primary" size={18} /></div>
                  <h3 className="font-bold text-lg">Cupom de Desconto</h3>
                </div>
                <div className="relative">
                  <Input placeholder="ADICIONAR CUPOM" className="h-14 rounded-2xl bg-muted/30 border-none font-bold uppercase" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} />
                  <button onClick={handleApplyCoupon} className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-white px-4 py-2 rounded-xl text-xs font-bold">APLICAR</button>
                </div>
                {appliedCoupon && <p className="text-xs font-bold text-primary flex items-center gap-1"><CheckCircle2 size={12} /> Cupom {appliedCoupon} aplicado!</p>}
              </div>
            </div>
          ) : (
            <div className="py-4 space-y-6 animate-in slide-in-from-bottom duration-500 overflow-x-hidden">
              <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
                <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Resumo</p>
                <p className="text-sm text-muted-foreground">O total do seu pedido é <span className="text-foreground font-black">{formatCurrency(total)}</span></p>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-lg">Escolha como pagar</h3>
                <div className="flex p-1 bg-muted rounded-2xl">
                  <button onClick={() => {setPaymentType('online'); setSelectedPayment("")}} className={cn("flex-1 py-3 rounded-xl text-sm font-bold transition-all", paymentType === 'online' ? "bg-white text-primary shadow-sm" : "text-muted-foreground")}>Pagar Online</button>
                  <button onClick={() => {setPaymentType('delivery'); setSelectedPayment("")}} className={cn("flex-1 py-3 rounded-xl text-sm font-bold transition-all", paymentType === 'delivery' ? "bg-white text-primary shadow-sm" : "text-muted-foreground")}>Na Entrega</button>
                </div>
              </div>

              <div className="animate-in fade-in slide-in-from-right-full duration-500 fill-mode-both" key={paymentType}>
                <RadioGroup value={selectedPayment} onValueChange={setSelectedPayment} className="grid gap-3">
                  {filteredMethods.map((method) => (
                    <Label key={method.id} htmlFor={method.id} className={cn("flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer", selectedPayment === method.id ? "border-primary bg-primary/5" : "border-muted")}>
                      <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-xl", selectedPayment === method.id ? "bg-primary text-white" : "bg-muted text-muted-foreground")}><method.icon size={20} /></div>
                        <span className="font-bold">{method.label}</span>
                      </div>
                      <RadioGroupItem value={method.id} id={method.id} className="sr-only" />
                    </Label>
                  ))}
                </RadioGroup>
              </div>
            </div>
          )}
        </ScrollArea>

        {items.length > 0 && (
          <div className="p-6 bg-muted/30 border-t rounded-t-[2rem]">
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span className="font-bold">{formatCurrency(subtotal)}</span></div>
              {discountAmount > 0 && <div className="flex justify-between text-sm text-primary font-bold"><span>Desconto (50%)</span><span>-{formatCurrency(discountAmount)}</span></div>}
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Taxa de Entrega</span><span className="font-bold">{formatCurrency(deliveryFee)}</span></div>
              <Separator />
              <div className="flex justify-between text-lg"><span className="font-black">Total</span><span className="font-black text-primary">{formatCurrency(total)}</span></div>
            </div>
            <SheetFooter>
              {step === 'cart' ? (
                <Button disabled={!isFormValid} onClick={() => setStep('payment')} className="w-full h-14 rounded-full text-lg font-bold bg-primary text-white">Ir para Pagamento</Button>
              ) : (
                <Button disabled={!selectedPayment} onClick={handleFinalize} className="w-full h-14 rounded-full text-lg font-bold bg-primary text-white">Finalizar Pedido</Button>
              )}
            </SheetFooter>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

