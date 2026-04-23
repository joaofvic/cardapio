export interface Meal {
  id: string;
  name: string;
  category: 'Chicken' | 'Beef' | 'Veggie' | 'Fish';
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
}

export interface CartItem extends Meal {
  quantity: number;
}
