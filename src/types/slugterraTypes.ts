export interface SlugMove {
  name: string;
  damage: number;
  type: string;
  description: string;
}

export interface Slug {
  name: string;
  image: string;
  element: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'ultra-rare' | 'legendary';
  level: number;
  xp: number;
  maxXp: number;
  moves: SlugMove[];
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  isGhoul?: boolean;
  isMegamorph?: boolean;
  fusionPower?: number;
}

export interface SlugPlayerData {
  slugs: {
    arsenal: Slug[];  // Player's slugs (up to 5)
    hideout: Slug[];  // Storage for extra slugs
  };
  lastSlugSpawn: Slug | null;
  slugCoins: number;
  tournaments: {
    wins: number;
    losses: number;
    ranking: number;
  };
  energy: number;
  maxEnergy: number;
  lastEnergyRefill: number | null;
}

export interface SlugBattle {
  id: string;
  challenger: string;
  opponent: string;
  challengerSlug: Slug;
  opponentSlug: Slug;
  turn: string;
  isActive: boolean;
  turnCount: number;
}

// Predefined slug data based on Slugterra wiki
export const SLUG_ELEMENTS = [
  'Fire', 'Water', 'Air', 'Earth', 'Energy', 
  'Ice', 'Plant', 'Electric', 'Psychic', 'Toxic',
  'Crystal', 'Metal', 'Shadow'
] as const;

export type SlugElement = typeof SLUG_ELEMENTS[number];