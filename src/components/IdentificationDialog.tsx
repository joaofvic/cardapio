
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Phone, Loader2, Pencil, CheckCircle2 } from "lucide-react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import { UserProfile } from "@/app/page";

interface IdentificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onIdentify: (user: UserProfile) => void;
  initialUser?: UserProfile;
}

export function IdentificationDialog({ isOpen, onClose, onIdentify, initialUser }: IdentificationDialogProps) {
  const [phone, setPhone] = useState(initialUser?.phone || "");
  const [name, setName] = useState(initialUser?.name || "");
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const firestore = useFirestore();

  useEffect(() => {
    if (isOpen) {
      if (initialUser) {
        setPhone(initialUser.phone);
        setName(initialUser.name);
      } else {
        setPhone("");
        setName("");
      }
    }
  }, [initialUser, isOpen]);

  useEffect(() => {
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length >= 10 && firestore && !initialUser && !loading && !searching) {
      handleLookup(cleanPhone);
    }
  }, [phone, firestore, initialUser, loading]);

  const handleLookup = async (phoneNumber: string) => {
    if (!firestore) return;
    setSearching(true);
    try {
      const docRef = doc(firestore, "users", phoneNumber);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        setName(data.name);
      }
    } catch (error) {
      // Silent
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !firestore) return;

    setLoading(true);
    const cleanPhone = phone.replace(/\D/g, "");
    
    try {
      const docRef = doc(firestore, "users", cleanPhone);
      
      const userProfile: UserProfile = {
        name,
        phone: cleanPhone,
        address: initialUser?.address || {
          street: "",
          number: "",
          neighborhood: "",
          city: "São Miguel - RN"
        }
      };
      
      await setDoc(docRef, userProfile, { merge: true });
      onIdentify(userProfile);
    } catch (error) {
      onIdentify({ name, phone: cleanPhone, address: initialUser?.address });
    } finally {
      setLoading(false);
    }
  };

  const isEditing = !!initialUser;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !loading && onClose()}>
      <DialogContent className="sm:max-w-[400px] rounded-[2.5rem] p-8 border-none bg-white shadow-2xl">
        <DialogHeader className="mb-8">
          <div className="bg-primary/10 w-20 h-20 rounded-3xl flex items-center justify-center mb-6 mx-auto relative animate-in zoom-in duration-500">
            {isEditing ? (
              <>
                <User className="text-primary" size={40} />
                <div className="absolute -top-1 -right-1 bg-white p-2 rounded-full shadow-md border border-primary/20 animate-pulse">
                  <Pencil className="text-primary" size={14} />
                </div>
              </>
            ) : (
              <User className="text-primary" size={40} />
            )}
          </div>
          <DialogTitle className="text-3xl font-black text-center tracking-tighter">
            {isEditing ? "Seu Perfil" : "Identificação"}
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground mt-2 font-medium px-4">
            {isEditing 
              ? "Atualize seus dados para um atendimento personalizado."
              : "Informe seus dados para salvar seu histórico e endereços."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
              Telefone (WhatsApp)
            </Label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(00) 00000-0000"
                className="h-14 pl-12 rounded-2xl bg-muted/30 border-none font-bold focus-visible:ring-primary focus-visible:ring-inset"
                type="tel"
                required
              />
              {searching && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <Loader2 className="animate-spin text-primary" size={18} />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
              Nome Completo
            </Label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Maria Silva"
                className="h-14 pl-12 rounded-2xl bg-muted/30 border-none font-bold focus-visible:ring-primary focus-visible:ring-inset"
                required
              />
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={loading || !name || phone.replace(/\D/g, "").length < 10}
            className="w-full h-16 rounded-full text-lg font-black bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 transition-all active:scale-95 uppercase tracking-tighter"
          >
            {loading ? <Loader2 className="animate-spin" /> : (
              <div className="flex items-center gap-2">
                {isEditing ? "Salvar Alterações" : "Confirmar Cadastro"}
                {!loading && <CheckCircle2 size={18} />}
              </div>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
