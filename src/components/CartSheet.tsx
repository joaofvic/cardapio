
"use client";

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
import { Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";

interface CartSheetProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
}

export function CartSheet({ isOpen, onClose, items, onUpdateQuantity, onRemove }: CartSheetProps) {
  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const deliveryFee = items.length > 0 ? 5.99 : 0;
  const total = subtotal + deliveryFee;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md bg-white border-l-0 rounded-l-[2rem] flex flex-col p-0">
        <div className="p-6 pb-2">
          <SheetHeader>
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-primary/10 p-2 rounded-xl">
                <ShoppingBag className="text-primary" size={20} />
              </div>
              <SheetTitle className="text-2xl font-black">Your Basket</SheetTitle>
            </div>
          </SheetHeader>
        </div>

        <ScrollArea className="flex-grow px-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="text-muted-foreground" size={40} />
              </div>
              <p className="text-lg font-bold text-foreground mb-1">Your basket is empty</p>
              <p className="text-sm text-muted-foreground">Add some delicious meals to get started!</p>
              <Button 
                variant="outline" 
                className="mt-6 rounded-full border-primary text-primary hover:bg-primary/10"
                onClick={onClose}
              >
                Browse Menu
              </Button>
            </div>
          ) : (
            <div className="space-y-6 py-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 group">
                  <div className="relative h-20 w-20 rounded-2xl overflow-hidden shrink-0 shadow-sm">
                    <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex flex-col justify-between flex-grow">
                    <div>
                      <h4 className="font-bold text-foreground leading-tight">{item.name}</h4>
                      <p className="text-primary font-bold text-sm">${item.price.toFixed(2)}</p>
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
          )}
        </ScrollArea>

        {items.length > 0 && (
          <div className="p-6 bg-muted/30 border-t rounded-t-[2rem]">
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-bold">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery Fee</span>
                <span className="font-bold">${deliveryFee.toFixed(2)}</span>
              </div>
              <Separator className="bg-border" />
              <div className="flex justify-between text-lg">
                <span className="font-black">Total</span>
                <span className="font-black text-primary">${total.toFixed(2)}</span>
              </div>
            </div>
            <SheetFooter>
              <Button className="w-full h-14 rounded-full text-lg font-bold bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 transition-all hover:scale-[1.02]">
                Checkout
              </Button>
            </SheetFooter>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
