
import { Meal } from '../types/meal';
import { PlaceHolderImages } from '../lib/placeholder-images';

const getImg = (id: string) => {
  if (!PlaceHolderImages) return '';
  const img = PlaceHolderImages.find(img => img.id === id);
  return img?.imageUrl || `https://picsum.photos/seed/${id}/400/300`;
};

export const MEALS: Meal[] = [
  {
    id: 'combo-1',
    name: 'Combo Performance Semanal',
    category: 'Combo',
    description: 'Kit com 5 refeições variadas de alto teor proteico, ideal para quem busca praticidade e resultados.',
    price: 159.90,
    protein: 180,
    carbs: 220,
    calories: 2400,
    imageUrl: getImg('meal-combo-1'),
    rating: 5.0,
    isSugarFree: true
  },
  // PROTEINS - CHICKEN
  { id: 'c1', name: 'Peito de frango grelhado', category: 'Chicken', description: 'Peito de frango grelhado temperado.', price: 0, protein: 31, carbs: 0, calories: 165, imageUrl: getImg('c1') },
  { id: 'c2', name: 'Peito de frango desfiado', category: 'Chicken', description: 'Frango desfiado suculento.', price: 0, protein: 28, carbs: 0, calories: 150, imageUrl: getImg('c2') },
  { id: 'c3', name: 'Frango em cubos', category: 'Chicken', description: 'Cubos de frango grelhados.', price: 0, protein: 30, carbs: 0, calories: 160, imageUrl: getImg('c3') },
  { id: 'c4', name: 'Frango ao molho mostarda', category: 'Chicken', description: 'Frango com molho de mostarda caseiro.', price: 0, protein: 29, carbs: 5, calories: 180, imageUrl: getImg('c4') },
  { id: 'c5', name: 'Frango cremoso', category: 'Chicken', description: 'Frango com creme leve.', price: 0, protein: 27, carbs: 8, calories: 210, imageUrl: getImg('c5') },
  { id: 'c6', name: 'Frango xadrez', category: 'Chicken', description: 'Frango com pimentões e cebola.', price: 0, protein: 25, carbs: 10, calories: 190, imageUrl: getImg('c6') },
  { id: 'c7', name: 'Strogonoff de frango', category: 'Chicken', description: 'Clássico strogonoff com creme de leite light.', price: 0, protein: 26, carbs: 12, calories: 230, imageUrl: getImg('c7') },
  
  // PROTEINS - BEEF
  { id: 'b1', name: 'Patinho moído', category: 'Beef', description: 'Carne bovina magra moída.', price: 0, protein: 26, carbs: 0, calories: 220, imageUrl: getImg('b1') },
  { id: 'b2', name: 'Carne em tiras grelhado', category: 'Beef', description: 'Tiras de carne bovina grelhadas.', price: 0, protein: 28, carbs: 0, calories: 240, imageUrl: getImg('b2') },
  { id: 'b3', name: 'Carne moída cozida com legumes', category: 'Beef', description: 'Mix nutritivo de carne e legumes.', price: 0, protein: 24, carbs: 8, calories: 210, imageUrl: getImg('b3') },
  { id: 'b4', name: 'Carne de panela', category: 'Beef', description: 'Carne bovina cozida lentamente.', price: 0, protein: 25, carbs: 5, calories: 250, imageUrl: getImg('b4') },
  { id: 'b5', name: 'Carne desfiada', category: 'Beef', description: 'Carne bovina desfiada e temperada.', price: 0, protein: 27, carbs: 0, calories: 230, imageUrl: getImg('b5') },
  { id: 'b6', name: 'Almôndegas', category: 'Beef', description: 'Almôndegas bovinas artesanais.', price: 0, protein: 22, carbs: 10, calories: 260, imageUrl: getImg('b6') },
  { id: 'b7', name: 'Carne moída ao molho de tomate', category: 'Beef', description: 'Carne moída com molho natural.', price: 0, protein: 23, carbs: 6, calories: 220, imageUrl: getImg('b7') },
  { id: 'b8', name: 'Fígado', category: 'Beef', description: 'Fígado bovino grelhado.', price: 0, protein: 24, carbs: 4, calories: 175, imageUrl: getImg('b8') },

  // OTHER PROTEINS
  { id: 'o1', name: 'Filé de tilápia', category: 'Fish', description: 'Peixe branco grelhado ou cozido.', price: 0, protein: 20, carbs: 0, calories: 130, imageUrl: getImg('o1') },
  { id: 'o2', name: 'Camarão', category: 'Fish', description: 'Camarões frescos grelhados.', price: 0, protein: 18, carbs: 1, calories: 100, imageUrl: getImg('o2') },

  // CARBS
  { id: 'cb1', name: 'Arroz branco', category: 'Carbs', description: 'Arroz branco soltinho.', price: 0, protein: 3, carbs: 28, calories: 130, imageUrl: getImg('cb1') },
  { id: 'cb2', name: 'Arroz integral', category: 'Carbs', description: 'Arroz integral nutritivo.', price: 0, protein: 3, carbs: 25, calories: 120, imageUrl: getImg('cb2') },
  { id: 'cb3', name: 'Arroz parboilizado', category: 'Carbs', description: 'Arroz parboilizado de qualidade.', price: 0, protein: 3, carbs: 27, calories: 125, imageUrl: getImg('cb3') },
  { id: 'cb4', name: 'Arroz 7 grãos', category: 'Carbs', description: 'Mix especial de grãos integrais.', price: 0, protein: 5, carbs: 24, calories: 140, imageUrl: getImg('cb4') },
  { id: 'cb5', name: 'Feijão carioca', category: 'Carbs', description: 'Clássico feijão carioca.', price: 0, protein: 5, carbs: 14, calories: 80, imageUrl: getImg('cb5') },
  { id: 'cb6', name: 'Feijão preto', category: 'Carbs', description: 'Feijão preto temperado.', price: 0, protein: 6, carbs: 15, calories: 85, imageUrl: getImg('cb6') },
  { id: 'cb7', name: 'Feijão fradinho', category: 'Carbs', description: 'Feijão fradinho cozido.', price: 0, protein: 7, carbs: 18, calories: 110, imageUrl: getImg('cb7') },
  { id: 'cb8', name: 'Feijão branco', category: 'Carbs', description: 'Feijão branco suculento.', price: 0, protein: 6, carbs: 16, calories: 95, imageUrl: getImg('cb8') },
  { id: 'cb9', name: 'Feijão de corda (feijão verde)', category: 'Carbs', description: 'Tradição regional.', price: 0, protein: 6, carbs: 14, calories: 85, imageUrl: getImg('cb9') },
  { id: 'cb10', name: 'Grão-de-bico', category: 'Carbs', description: 'Grão-de-bico cozido.', price: 0, protein: 8, carbs: 20, calories: 160, imageUrl: getImg('cb10') },
  { id: 'cb11', name: 'Macarrão integral', category: 'Carbs', description: 'Pasta de trigo integral.', price: 0, protein: 6, carbs: 26, calories: 150, imageUrl: getImg('cb11') },
  { id: 'cb12', name: 'Macarrão de arroz', category: 'Carbs', description: 'Opção sem glúten.', price: 0, protein: 3, carbs: 25, calories: 120, imageUrl: getImg('cb12') },
  { id: 'cb13', name: 'Macarrão de abobrinha', category: 'Carbs', description: 'Baixo carboidrato.', price: 0, protein: 1, carbs: 3, calories: 20, imageUrl: getImg('cb13') },
  { id: 'cb14', name: 'Macarrão normal (penne, espaguete)', category: 'Carbs', description: 'Massa clássica.', price: 0, protein: 5, carbs: 30, calories: 160, imageUrl: getImg('cb14') },
  { id: 'cb15', name: 'Batata inglesa (refogada, rústica)', category: 'Carbs', description: 'Batata inglesa preparada com ervas.', price: 0, protein: 2, carbs: 17, calories: 80, imageUrl: getImg('cb15') },
  { id: 'cb16', name: 'Batata-doce (cozida, grelhada)', category: 'Carbs', description: 'Batata-doce energética.', price: 0, protein: 2, carbs: 20, calories: 90, imageUrl: getImg('cb16') },
  { id: 'cb17', name: 'Macaxeira (cozida, grelhada)', category: 'Carbs', description: 'Mandioca cozida ou grelhada.', price: 0, protein: 1, carbs: 38, calories: 160, imageUrl: getImg('cb17') },
  { id: 'cb18', name: 'Abóbora (leite, jacarezinho)', category: 'Carbs', description: 'Abóbora cozida.', price: 0, protein: 1, carbs: 7, calories: 30, imageUrl: getImg('cb18') },
  { id: 'cb19', name: 'Purê de batata doce', category: 'Carbs', description: 'Cremoso de batata doce.', price: 0, protein: 2, carbs: 18, calories: 100, imageUrl: getImg('cb19') },
  { id: 'cb20', name: 'Purê de batata inglesa', category: 'Carbs', description: 'Cremoso de batata inglesa.', price: 0, protein: 2, carbs: 15, calories: 90, imageUrl: getImg('cb20') },
  { id: 'cb21', name: 'Purê de jerimum', category: 'Carbs', description: 'Purê de abóbora.', price: 0, protein: 1, carbs: 6, calories: 40, imageUrl: getImg('cb21') },

  // VEGGIES
  { id: 'v1', name: 'Brócolis', category: 'Veggie', description: 'Brócolis frescos no vapor.', price: 0, protein: 3, carbs: 7, calories: 35, imageUrl: getImg('v1') },
  { id: 'v2', name: 'Couve-flor', category: 'Veggie', description: 'Couve-flor no vapor.', price: 0, protein: 2, carbs: 5, calories: 25, imageUrl: getImg('v2') },
  { id: 'v3', name: 'Cenoura', category: 'Veggie', description: 'Cenouras cozidas ou rústicas.', price: 0, protein: 1, carbs: 10, calories: 40, imageUrl: getImg('v3') },
  { id: 'v4', name: 'Abobrinha', category: 'Veggie', description: 'Abobrinha grelhada.', price: 0, protein: 1, carbs: 3, calories: 20, imageUrl: getImg('v4') },
  { id: 'v5', name: 'Chuchu', category: 'Veggie', description: 'Chuchu cozido.', price: 0, protein: 1, carbs: 4, calories: 20, imageUrl: getImg('v5') },
  { id: 'v6', name: 'Vagem', category: 'Veggie', description: 'Vagem salteada.', price: 0, protein: 2, carbs: 7, calories: 30, imageUrl: getImg('v6') },
  { id: 'v7', name: 'Abóbora (leite, jacarezinho)', category: 'Veggie', description: 'Abóbora cozida.', price: 0, protein: 1, carbs: 7, calories: 30, imageUrl: getImg('v7') },
  { id: 'v8', name: 'Beterraba', category: 'Veggie', description: 'Beterraba cozida.', price: 0, protein: 2, carbs: 10, calories: 45, imageUrl: getImg('v8') },
  { id: 'v9', name: 'Couve folha (refogada)', category: 'Veggie', description: 'Couve refogada com alho.', price: 0, protein: 2, carbs: 6, calories: 30, imageUrl: getImg('v9') },
  { id: 'v10', name: 'Quiabo (refogado)', category: 'Veggie', description: 'Quiabo refogado.', price: 0, protein: 2, carbs: 7, calories: 35, imageUrl: getImg('v10') },
  { id: 'v11', name: 'Ervilha', category: 'Veggie', description: 'Ervilhas frescas.', price: 0, protein: 5, carbs: 14, calories: 80, imageUrl: getImg('v11') },
  { id: 'v12', name: 'Milho verde', category: 'Veggie', description: 'Milho verde cozido.', price: 0, protein: 3, carbs: 19, calories: 85, imageUrl: getImg('v12') },
  { id: 'v13', name: 'Seleta de legumes', category: 'Veggie', description: 'Mix de cenoura, batata, abobrinha, milho, ervilha.', price: 0, protein: 2, carbs: 12, calories: 60, imageUrl: getImg('v13') },
  { id: 'v14', name: 'Mix Brócolis, Cenoura e Couve-flor', category: 'Veggie', description: 'Mix clássico de vegetais.', price: 0, protein: 2, carbs: 8, calories: 45, imageUrl: getImg('v14') }
];
