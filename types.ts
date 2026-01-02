export enum Stage {
  EGG = 'EGG',
  BABY = 'BABY',
  TEEN = 'TEEN',
  ADULT = 'ADULT'
}

export type TraitType = 'color' | 'ears' | 'eyes' | 'mouth' | 'accessory';

// Define the possible visual traits
export const TRAIT_OPTIONS = {
  color: ['#FFB7C5', '#A0E7E5', '#FEF9C3', '#E6E6FA', '#FFDAC1'], // Pink, Blue, Yellow, Lavender, Peach
  ears: ['bear', 'rabbit', 'cat', 'droopy'],
  eyes: ['dot', 'sparkle', 'sleepy', 'happy'],
  mouth: ['smile', 'cat', 'o', 'tiny'],
  accessory: ['bow', 'star', 'none', 'flower']
} as const;

export interface Genes {
  color: string;
  ears: string;
  eyes: string;
  mouth: string;
  accessory: string;
}

export interface Character {
  id: string;
  name: string;
  generation: number;
  stage: Stage;
  genes: Genes;
  birthDate: number;
  lastFed: number;
  feedsSinceLastStage: number; // New property to track growth via feeding
  happiness: number;
  parents: [string | null, string | null]; // ID of parents. [0] is player's prev pet, [1] is spouse
}

export interface FamilyTreeData {
  [id: string]: Character;
}

export interface NpcCandidate {
  name: string;
  description: string;
  genes: Genes;
}