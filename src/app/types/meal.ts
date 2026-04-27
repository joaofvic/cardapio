export interface Meal {
  id: string;
  name: string;
  category: 'Chicken' | 'Beef' | 'Veggie' | 'Fish' | 'Combo';
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
  // Metadata for custom combos to allow editing
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
