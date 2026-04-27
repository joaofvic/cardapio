
export interface Meal {
  id: string;
  name: string;
  category: 'Chicken' | 'Beef' | 'Veggie' | 'Fish' | 'Combo' | 'Carbs' | 'Other';
  description: string;
  price: number;
  protein: number;
  carbs: number;
  calories: number;
  imageUrl: string;
  rating?: number;
  isDairyFree?: boolean;
  isGlutenFree?: boolean;
  isSugarFree?: boolean;
  isArchived?: boolean;
  isAvailableForCombo?: boolean;
  configuration?: {
    marmitaCount: number;
    selectedSize: { label: string; price: number };
    marmitas: Meal[][];
    peopleNames?: string[];
  };
}

export interface CartItem extends Meal {
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: 'pending' | 'preparing' | 'delivery' | 'completed' | 'cancelled';
  paymentMethod: string;
  createdAt: string;
  address: any;
}
