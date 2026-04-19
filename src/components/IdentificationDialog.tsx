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
import { User, Phone, Loader2 } from "lucide-react";
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

  // Auto-lookup when phone reaches 11 digits (Brazilian mobile standard)
  useEffect(() => {
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length >= 10 && firestore) {
      handleLookup(cleanPhone);
    }
  }, [phone, firestore]);

  const handleLookup = async (phoneNumber: string) => {
    if (searching || !firestore) return;
    setSearching(true);
    try {
      const docRef = doc(firestore, "users", phoneNumber);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        setName(data.name);
      }
    } catch (error) {
      // Handle lookup error silently
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
      const docSnap = await getDoc(docRef);
      
      let userProfile: UserProfile;

      if (docSnap.exists()) {
        userProfile = docSnap.data() as UserProfile;
        // Update name if it was changed in the input
        if (name !== userProfile.name) {
          userProfile.name = name;
          setDoc(docRef, userProfile, { merge: true });
        }
      } else {
        // Create new profile
        userProfile = {
          name,
          phone: cleanPhone,
          address: {
            street: "",
            number: "",
            neighborhood: "",
            city: "São Miguel - RN"
          }
        };
        setDoc(docRef, userProfile);
      }

      onIdentify(userProfile);
    } catch (error) {
      // Fallback to local identification if Firestore fails
      onIdentify({ name, phone: cleanPhone });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !loading && (open || initialUser) && onClose()}>
      <DialogContent className="sm:max-w-[400px] rounded-[2rem] p-8 border-none bg-white">
        <DialogHeader className="mb-6">
          <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 mx-auto">
            <User className="text-primary" size={32} />
          </div>
          <DialogTitle className="text-2xl font-black text-center">Identificação</DialogTitle>
          <DialogDescription className="text-center">
            Informe seu telefone para carregarmos seu cadastro.
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
                className="h-14 pl-12 rounded-2xl bg-muted/30 border-none font-bold"
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
                placeholder="Seu nome..."
                className="h-14 pl-12 rounded-2xl bg-muted/30 border-none font-bold"
                required
              />
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={loading || !name || phone.length < 10}
            className="w-full h-14 rounded-full text-lg font-bold bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Confirmar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
