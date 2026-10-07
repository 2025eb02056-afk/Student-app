import { GoogleGenAI } from '@google/genai';
import { db } from '../db/index.js';
import { env } from '../utils/env.js';
import {
  AIRecommendationResponseSchema,
  NaturalLanguageSearchResponseSchema
} from '../shared/schemas/index.js';
import {
  AIRecommendationResponse,
  NaturalLanguageSearchResponse,
  MenuItem
} from '../shared/types/index.js';

const SYSTEM_PROMPT = `You are the AI Food Advisory Assistant for a student-focused food delivery platform.

Your job is to help students discover suitable meals based on:
- Budget
- Dietary preference
- Food category
- Availability
- Preparation time
- Delivery time
- Existing menu data

You MUST only recommend food items that exist in the provided database context.

Never invent restaurants, vendors, menu items, prices, ratings, delivery times, or availability.

If the user's budget is insufficient, clearly explain that.

Prioritize affordable and filling meals for students.

Do not provide medical advice.

Do not claim that food is medically suitable for a disease or medical condition.

When recommending items, explain briefly why each item matches the user's requirements.

Always return the requested structured JSON format.

Do not include markdown outside the JSON response.`;

export class AIService {
  private static getGeminiClient(): GoogleGenAI | null {
    if (!env.GEMINI_API_KEY || env.GEMINI_API_KEY.includes('your_gemini_api_key')) {
      return null;
    }
    try {
      return new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
    } catch {
      return null;
    }
  }

  static async getBudgetRecommendations(
    budget: number,
    dietaryPreference: 'veg' | 'non-veg' | 'any',
    mealType?: string | null
  ): Promise<AIRecommendationResponse> {
    // 1. Fetch real available menu items from database
    let query = `
      SELECT m.id, m.name, m.description, m.price::float, m.is_vegetarian as "isVegetarian",
             m.preparation_time as "preparationTime", v.name as "vendorName",
             v.delivery_fee::float as "deliveryFee"
      FROM menu_items m
      JOIN vendors v ON m.vendor_id = v.id
      WHERE m.is_available = true AND v.is_open = true AND m.price <= $1
    `;
    const params: any[] = [budget];

    if (dietaryPreference === 'veg') {
      query += ` AND m.is_vegetarian = true`;
    } else if (dietaryPreference === 'non-veg') {
      query += ` AND m.is_vegetarian = false`;
    }

    query += ` ORDER BY m.price ASC LIMIT 25`;

    const availableRes = await db.query(query, params);
    const availableItems = availableRes.rows;

    if (availableItems.length === 0) {
      return {
        recommendations: [],
        summary: `We couldn't find any available ${dietaryPreference !== 'any' ? dietaryPreference + ' ' : ''}meals within your budget of ₹${budget}. Try increasing your budget or checking other categories.`
      };
    }

    // 2. Try Gemini API if key is present
    const aiClient = this.getGeminiClient();
    if (aiClient) {
      try {
        const prompt = `Recommend the best food options for a student.

Budget: ${budget}
Dietary preference: ${dietaryPreference}
Meal type: ${mealType || 'any'}

Available menu items:
${JSON.stringify(availableItems, null, 2)}

Only recommend items from the provided list.

Prioritize:
1. Staying within budget
2. Filling meals
3. Relevant dietary preference
4. Good value
5. Lower delivery cost when possible

Required output JSON schema:
{
  "recommendations": [
    {
      "menuItemId": "uuid",
      "reason": "string",
      "price": 0,
      "valueScore": 0
    }
  ],
  "summary": "string"
}`;

        const response = await aiClient.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `${SYSTEM_PROMPT}\n\n${prompt}`,
          config: {
            responseMimeType: 'application/json'
          }
        });

        const text = response.text || '';
        const parsed = JSON.parse(text);
        const validated = AIRecommendationResponseSchema.safeParse(parsed);

        if (validated.success) {
          const validItemMap = new Map(availableItems.map(i => [i.id, i]));
          const verifiedRecs = validated.data.recommendations
            .filter(r => validItemMap.has(r.menuItemId))
            .map(r => {
              const dbItem = validItemMap.get(r.menuItemId)!;
              return {
                menuItemId: r.menuItemId,
                reason: r.reason,
                price: dbItem.price,
                valueScore: r.valueScore,
                menuItem: dbItem
              };
            });

          if (verifiedRecs.length > 0) {
            return {
              recommendations: verifiedRecs,
              summary: validated.data.summary
            };
          }
        }
      } catch (geminiError: any) {
        console.warn('Gemini request failed, falling back to heuristic engine:', geminiError.message);
      }
    }

    // 3. Fallback Heuristic Student Optimizer
    const sorted = [...availableItems].sort((a, b) => {
      const scoreA = (budget - a.price) / budget;
      const scoreB = (budget - b.price) / budget;
      return scoreA - scoreB;
    });

    const topPicks = sorted.slice(0, 4).map((item, idx) => {
      let reason = `Priced at ₹${item.price}, leaving ₹${budget - item.price} in your budget.`;
      if (item.name.toLowerCase().includes('thali') || item.name.toLowerCase().includes('combo')) {
        reason = `Top student pick: wholesome and filling meal for ₹${item.price}.`;
      } else if (item.isVegetarian) {
        reason = `Fresh and satisfying vegetarian meal ready in ~${item.preparationTime} mins.`;
      }

      return {
        menuItemId: item.id,
        reason,
        price: item.price,
        valueScore: Math.round((95 - idx * 5) * 10) / 10,
        menuItem: item
      };
    });

    return {
      recommendations: topPicks,
      summary: `Found ${topPicks.length} filling and budget-friendly meals under ₹${budget} from campus kitchens.`
    };
  }

  static async naturalLanguageFoodSearch(
    userQuery: string
  ): Promise<NaturalLanguageSearchResponse> {
    // 1. Fetch active menu items
    const allItemsRes = await db.query(`
      SELECT m.id, m.name, m.description, m.price::float, m.is_vegetarian as "isVegetarian",
             v.name as "vendorName"
      FROM menu_items m
      JOIN vendors v ON m.vendor_id = v.id
      WHERE m.is_available = true AND v.is_open = true
      LIMIT 40
    `);
    const availableItems = allItemsRes.rows;

    const aiClient = this.getGeminiClient();
    if (aiClient) {
      try {
        const prompt = `User search query: "${userQuery}"

Available menu items:
${JSON.stringify(availableItems, null, 2)}

Interpret the user's intent and match the most relevant items strictly from the list.

Required output JSON schema:
{
  "interpretedIntent": {
    "budget": 100,
    "foodPreference": "spicy",
    "mealType": null
  },
  "matchingItems": [
    {
      "menuItemId": "uuid",
      "reason": "string"
    }
  ]
}`;

        const response = await aiClient.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `${SYSTEM_PROMPT}\n\n${prompt}`,
          config: {
            responseMimeType: 'application/json'
          }
        });

        const text = response.text || '';
        const parsed = JSON.parse(text);
        const validated = NaturalLanguageSearchResponseSchema.safeParse(parsed);

        if (validated.success) {
          const itemMap = new Map(availableItems.map(i => [i.id, i]));
          const verifiedMatches = validated.data.matchingItems
            .filter(m => itemMap.has(m.menuItemId))
            .map(m => ({
              menuItemId: m.menuItemId,
              reason: m.reason,
              menuItem: itemMap.get(m.menuItemId)
            }));

          if (verifiedMatches.length > 0) {
            return {
              interpretedIntent: {
                budget: validated.data.interpretedIntent.budget ?? null,
                foodPreference: validated.data.interpretedIntent.foodPreference ?? null,
                mealType: validated.data.interpretedIntent.mealType ?? null
              },
              matchingItems: verifiedMatches
            };
          }
        }
      } catch (geminiError: any) {
        console.warn('Gemini NL search failed, falling back:', geminiError.message);
      }
    }

    // Heuristic NL search fallback
    const lower = userQuery.toLowerCase();
    const budgetMatch = lower.match(/(?:under|below|less than|within|\u20B9|rs\.?)\s*(\d+)/i);
    const budget = budgetMatch ? parseInt(budgetMatch[1], 10) : null;
    const isVegQuery = lower.includes('veg') && !lower.includes('non-veg');
    const isSpicy = lower.includes('spicy') || lower.includes('masala') || lower.includes('chili');

    const matches = availableItems.filter(item => {
      if (budget && item.price > budget) return false;
      if (isVegQuery && !item.isVegetarian) return false;

      const itemText = `${item.name} ${item.description}`.toLowerCase();
      const keywords = userQuery.toLowerCase().split(/\s+/).filter(w => w.length > 2);
      return keywords.some(k => itemText.includes(k)) || (isSpicy && itemText.includes('spic'));
    });

    const chosen = (matches.length > 0 ? matches : availableItems.slice(0, 3)).slice(0, 5);

    return {
      interpretedIntent: {
        budget: budget !== null && !isNaN(budget) ? budget : null,
        foodPreference: isVegQuery ? 'vegetarian' : isSpicy ? 'spicy' : null,
        mealType: null
      },
      matchingItems: chosen.map(item => ({
        menuItemId: item.id,
        reason: `Matches your craving for "${userQuery}" at only ₹${item.price}`,
        menuItem: item
      }))
    };
  }
}
