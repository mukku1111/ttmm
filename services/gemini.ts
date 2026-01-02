import { GoogleGenAI, Type } from "@google/genai";
import { Genes, NpcCandidate, TRAIT_OPTIONS } from '../types';

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateNpcCandidates = async (generation: number): Promise<NpcCandidate[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate 3 distinct, cute, Sanrio-style character descriptions for potential marriage candidates in a virtual pet game. Generation: ${generation}. 
      They should have names and brief personalities.
      Return traits that map to these specific options:
      Colors: ${JSON.stringify(TRAIT_OPTIONS.color)}
      Ears: ${JSON.stringify(TRAIT_OPTIONS.ears)}
      Eyes: ${JSON.stringify(TRAIT_OPTIONS.eyes)}
      Mouths: ${JSON.stringify(TRAIT_OPTIONS.mouth)}
      Accessories: ${JSON.stringify(TRAIT_OPTIONS.accessory)}
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              genes: {
                type: Type.OBJECT,
                properties: {
                  color: { type: Type.STRING },
                  ears: { type: Type.STRING },
                  eyes: { type: Type.STRING },
                  mouth: { type: Type.STRING },
                  accessory: { type: Type.STRING },
                },
                required: ["color", "ears", "eyes", "mouth", "accessory"]
              }
            },
            required: ["name", "description", "genes"]
          }
        }
      }
    });

    const data = JSON.parse(response.text || '[]');
    return data as NpcCandidate[];
  } catch (error) {
    console.error("Failed to generate NPCs via Gemini", error);
    // Fallback if API fails
    return [
      {
        name: "Berry",
        description: "A sweet local baker.",
        genes: { color: '#FFB7C5', ears: 'rabbit', eyes: 'sparkle', mouth: 'smile', accessory: 'bow' }
      },
      {
        name: "Cloudy",
        description: "loves to nap in the sky.",
        genes: { color: '#A0E7E5', ears: 'bear', eyes: 'sleepy', mouth: 'o', accessory: 'none' }
      },
      {
        name: "Sunny",
        description: "Always energetic!",
        genes: { color: '#FEF9C3', ears: 'cat', eyes: 'happy', mouth: 'cat', accessory: 'star' }
      }
    ];
  }
};
