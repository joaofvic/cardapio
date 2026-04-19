
export interface Meal {
  id: string;
  name: string;
  category: 'Chicken' | 'Beef' | 'Veggie';
  description: string;
  price: number;
  protein: number;
  carbs: number;
  calories: number;
  imageUrl: string;
  rating?: number;
}

export interface CartItem extends Meal {
  quantity: number;
}
