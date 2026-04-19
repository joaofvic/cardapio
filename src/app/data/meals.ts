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
    description: 'Frango grelhado suculento temperado com limão e ervas frescas, servido com vegetais da estação.',
    price: 32.90,
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
    description: 'Frango BBQ grelhado lentamente sobre uma cama de arroz selvagem nutritivo e salsa de milho tostado.',
    price: 34.90,
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
    description: 'Fatias de carne premium servidas com purê de batata doce e brócolis assado com alho.',
    price: 45.90,
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
    description: 'Carne marinada autêntica com arroz jasmim no vapor e pepinos em conserva.',
    price: 42.90,
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
    description: 'Uma mistura vibrante de quinoa orgânica, abóbora assada, grão-de-bico e um toque de tahine.',
    price: 28.90,
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
    description: 'Vegetais de raiz sazonais assados com perfeição com cobertura balsâmica e amêndoas torradas.',
    price: 26.90,
    protein: 8,
    carbs: 32,
    calories: 280,
    imageUrl: getImg('meal-veggie-2'),
    rating: 4.4
  }
];
