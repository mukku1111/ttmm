import { Character, FamilyTreeData, Genes, TRAIT_OPTIONS } from '../types';

// Helper to get random item from array
const randomItem = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Generate a random starter set of genes
export const generateRandomGenes = (): Genes => {
  return {
    color: randomItem(TRAIT_OPTIONS.color),
    ears: randomItem(TRAIT_OPTIONS.ears),
    eyes: randomItem(TRAIT_OPTIONS.eyes),
    mouth: randomItem(TRAIT_OPTIONS.mouth),
    accessory: randomItem(TRAIT_OPTIONS.accessory),
  };
};

/**
 * Breeding Logic
 * - Primarily mixes genes from Parent 1 and Parent 2 (50/50 base chance).
 * - Has a small chance (20%) to inherit a gene from a grandparent (Ancestral Throwback) if available.
 * - This ensures the child is a mix of the lineage, as requested.
 */
export const breed = (
  parent1: Character,
  parent2Genes: Genes, // NPC might not be in full history, so we pass genes directly
  history: FamilyTreeData
): Genes => {
  const newGenes: any = {};
  const geneKeys = Object.keys(parent1.genes) as Array<keyof Genes>;

  // Find grandparents from the player's side history
  // (We only track player's lineage deep history in this simplified app)
  const grandparent1 = parent1.parents[0] ? history[parent1.parents[0]!] : null;
  const grandparent2 = parent1.parents[1] ? history[parent1.parents[1]!] : null;
  
  const ancestralPool: Character[] = [];
  if (grandparent1) ancestralPool.push(grandparent1);
  if (grandparent2) ancestralPool.push(grandparent2);

  geneKeys.forEach((key) => {
    // 1. Determine base source: Parent 1 or Parent 2
    // This creates the "random mix" of parents.
    const isParent1 = Math.random() < 0.5;
    let selectedGene = isParent1 ? parent1.genes[key] : parent2Genes[key];

    // 2. Ancestral Throwback Check
    // "Sometimes the genes of grandparents who became adults should be inherited"
    if (ancestralPool.length > 0) {
      // 20% chance to attempt throwback
      if (Math.random() < 0.20) {
        const ancestor = randomItem(ancestralPool);
        selectedGene = ancestor.genes[key];
        // console.log(`Gene [${key}] inherited from ancestor ${ancestor.name}!`);
      }
    }

    newGenes[key] = selectedGene;
  });

  return newGenes as Genes;
};

/**
 * Mature Genes Logic
 * - Called when transitioning from TEEN to ADULT.
 * - Creates variation:
 *   1. 40% chance: Stay exactly as is (The mix from childhood).
 *   2. 30% chance: Shift closer to Parent 1 (Dominant genes kick in).
 *   3. 30% chance: Shift closer to Parent 2.
 */
export const matureGenes = (
  child: Character, 
  history: FamilyTreeData
): Genes => {
  const p1Id = child.parents[0];
  const p2Id = child.parents[1];
  
  // If no parents (Generation 1), no change.
  if (!p1Id || !p2Id) return { ...child.genes };

  const parent1 = history[p1Id];
  const parent2 = history[p2Id];

  // If parents are missing from history for some reason, return current.
  if (!parent1 || !parent2) return { ...child.genes };

  const roll = Math.random();
  const geneKeys = Object.keys(child.genes) as Array<keyof Genes>;
  const newGenes = { ...child.genes };

  if (roll < 0.4) {
    // 40% Chance: No Change (Childhood look is final)
    console.log("Matured: No changes");
    return newGenes;
  } else if (roll < 0.7) {
    // 30% Chance: Resemble Parent 1 More
    // Overwrite 2 random traits with Parent 1's traits
    console.log("Matured: Resembling Parent 1");
    for (let i = 0; i < 2; i++) {
        const key = randomItem(geneKeys);
        newGenes[key] = parent1.genes[key];
    }
  } else {
    // 30% Chance: Resemble Parent 2 More
    console.log("Matured: Resembling Parent 2");
    for (let i = 0; i < 2; i++) {
        const key = randomItem(geneKeys);
        newGenes[key] = parent2.genes[key];
    }
  }

  return newGenes;
};
