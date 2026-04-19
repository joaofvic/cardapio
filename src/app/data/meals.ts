import { Meal } from '../types/meal';
import { PlaceHolderImages } from '../lib/placeholder-images';

const getImg = (id: string) => {
  if (!PlaceHolderImages) return '';
  return PlaceHolderImages.find(img => img.id === id)?.imageUrl || '';
};

export const MEALS: Meal[] = [
  {
    id: '1',
    name: 'Lemon Herb Chicken',
    category: 'Chicken',
    description: 'Juicy roasted chicken breast seasoned with zesty lemon and garden-fresh herbs, served with seasonal greens.',
    price: 12.99,
    protein: 38,
    carbs: 12,
    calories: 320,
    imageUrl: getImg('meal-chicken-1'),
    rating: 4.8
  },
  {
    id: '2',
    name: 'BBQ Power Bowl',
    category: 'Chicken',
    description: 'Slow-grilled BBQ chicken over a bed of nutritious wild rice and charred corn salsa.',
    price: 13.49,
    protein: 35,
    carbs: 45,
    calories: 480,
    imageUrl: getImg('meal-chicken-2'),
    rating: 4.6
  },
  {
    id: '3',
    name: 'Steak & Sweet Potato',
    category: 'Beef',
    description: 'Premium grass-fed steak slices served with mashed sweet potatoes and roasted garlic broccoli.',
    price: 15.99,
    protein: 42,
    carbs: 38,
    calories: 550,
    imageUrl: getImg('meal-beef-1'),
    rating: 4.9
  },
  {
    id: '4',
    name: 'Korean Beef Bulgogi',
    category: 'Beef',
    description: 'Authentic marinated beef bulgogi with steamed jasmine rice and pickled cucumbers.',
    price: 14.99,
    protein: 30,
    carbs: 55,
    calories: 520,
    imageUrl: getImg('meal-beef-2'),
    rating: 4.7
  },
  {
    id: '5',
    name: 'Quinoa Harvest Bowl',
    category: 'Veggie',
    description: 'A vibrant mix of organic quinoa, roasted squash, chickpeas, and a maple-tahini drizzle.',
    price: 11.49,
    protein: 15,
    carbs: 58,
    calories: 410,
    imageUrl: getImg('meal-veggie-1'),
    rating: 4.5
  },
  {
    id: '6',
    name: 'Roasted Veggie Medley',
    category: 'Veggie',
    description: 'Seasonal root vegetables roasted to perfection with balsamic glaze and toasted almonds.',
    price: 10.99,
    protein: 8,
    carbs: 32,
    calories: 280,
    imageUrl: getImg('meal-veggie-2'),
    rating: 4.4
  }
];
