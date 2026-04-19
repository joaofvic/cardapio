'use server';
/**
 * @fileOverview An AI agent that provides personalized meal recommendations.
 *
 * - aiMealRecommendation - A function that handles the meal recommendation process.
 * - AIMealRecommendationInput - The input type for the aiMealRecommendation function.
 * - AIMealRecommendationOutput - The return type for the aiMealRecommendation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MealItemSchema = z.object({
  name: z.string().describe('The name of the meal.'),
  category: z.string().describe('The category of the meal (e.g., Chicken, Beef, Veggie).'),
  description: z.string().describe('A brief description of the meal.'),
  protein: z.number().describe('Protein content in grams.'),
  carbs: z.number().describe('Carbohydrate content in grams.'),
  calories: z.number().describe('Calorie content.'),
});

const AIMealRecommendationInputSchema = z.object({
  browsingHistory: z
    .array(z.string())
    .describe('A list of meal names or descriptions that the user has previously browsed or interacted with.'),
  availableMeals: z
    .array(MealItemSchema)
    .describe('A list of available meals, including their characteristics, from which to make recommendations.'),
});
export type AIMealRecommendationInput = z.infer<typeof AIMealRecommendationInputSchema>;

const AIMealRecommendationOutputSchema = z.object({
  recommendations: z.array(z.string()).describe('A list of recommended meal names.'),
});
export type AIMealRecommendationOutput = z.infer<typeof AIMealRecommendationOutputSchema>;

export async function aiMealRecommendation(
  input: AIMealRecommendationInput
): Promise<AIMealRecommendationOutput> {
  return aiMealRecommendationFlow(input);
}

const aiMealRecommendationPrompt = ai.definePrompt({
  name: 'aiMealRecommendationPrompt',
  input: {schema: AIMealRecommendationInputSchema},
  output: {schema: AIMealRecommendationOutputSchema},
  prompt: `You are a helpful AI assistant that recommends meals.

Based on the user's browsing history, suggest up to 3 "Popular Favorites" meals from the available list that they might enjoy.
Prioritize meals that align with categories, nutritional profiles, or descriptions from their browsing history.
Only recommend meals from the 'Available Meals' list provided. Ensure the recommended meal names exactly match those in the 'Available Meals' list.

User browsing history:
{{{json browsingHistory}}}

Available Meals:
{{{json availableMeals}}}

Provide your recommendations as a JSON array of meal names, like this: {"recommendations": ["Meal Name 1", "Meal Name 2"]}
`,
});

const aiMealRecommendationFlow = ai.defineFlow(
  {
    name: 'aiMealRecommendationFlow',
    inputSchema: AIMealRecommendationInputSchema,
    outputSchema: AIMealRecommendationOutputSchema,
  },
  async input => {
    const {output} = await aiMealRecommendationPrompt(input);
    return output!;
  }
);
