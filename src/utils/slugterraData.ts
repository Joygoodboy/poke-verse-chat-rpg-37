import { Slug, SlugMove, SlugElement } from '@/types/slugterraTypes';

// Base slug data from Slugterra wiki
export const SLUG_DATABASE: Record<string, Omit<Slug, 'level' | 'xp' | 'maxXp'>> = {
  // Fire Element Slugs
  'infurnus': {
    name: 'Infurnus',
    image: 'https://slugterra.fandom.com/wiki/Special:FilePath/Infurnus.png',
    element: 'Fire',
    rarity: 'legendary',
    moves: [
      { name: 'Flame Burst', damage: 35, type: 'Fire', description: 'A powerful fire attack that burns the opponent' },
      { name: 'Inferno Blast', damage: 45, type: 'Fire', description: 'An intense blast of flames' },
      { name: 'Fire Storm', damage: 40, type: 'Fire', description: 'Creates a storm of fire around the battlefield' },
      { name: 'Phoenix Rise', damage: 50, type: 'Fire', description: 'Ultimate fire attack with revival power' }
    ],
    hp: 120,
    maxHp: 120,
    attack: 45,
    defense: 30,
    speed: 35,
    fusionPower: 95
  },
  
  'flaringo': {
    name: 'Flaringo',
    image: 'https://slugterra.fandom.com/wiki/Special:FilePath/Flaringo.png',
    element: 'Fire',
    rarity: 'common',
    moves: [
      { name: 'Flame Wing', damage: 20, type: 'Fire', description: 'Attacks with flaming wings' },
      { name: 'Fire Dart', damage: 25, type: 'Fire', description: 'Quick fire projectile' },
      { name: 'Heat Wave', damage: 22, type: 'Fire', description: 'Creates a wave of intense heat' }
    ],
    hp: 80,
    maxHp: 80,
    attack: 25,
    defense: 20,
    speed: 30,
    fusionPower: 60
  },

  // Water Element Slugs
  'aquabeek': {
    name: 'Aquabeek',
    image: 'https://slugterra.fandom.com/wiki/Special:FilePath/Aquabeek.png',
    element: 'Water',
    rarity: 'common',
    moves: [
      { name: 'Water Jet', damage: 20, type: 'Water', description: 'High pressure water attack' },
      { name: 'Bubble Burst', damage: 18, type: 'Water', description: 'Explosive water bubbles' },
      { name: 'Tidal Wave', damage: 28, type: 'Water', description: 'Creates a powerful wave' }
    ],
    hp: 85,
    maxHp: 85,
    attack: 22,
    defense: 25,
    speed: 28,
    fusionPower: 55
  },

  'makobreaker': {
    name: 'Makobreaker',
    image: 'https://slugterra.fandom.com/wiki/Special:FilePath/Makobreaker.png',
    element: 'Water',
    rarity: 'rare',
    moves: [
      { name: 'Shark Strike', damage: 32, type: 'Water', description: 'Powerful shark-like attack' },
      { name: 'Depth Charge', damage: 35, type: 'Water', description: 'Deep water explosion' },
      { name: 'Tsunami Force', damage: 38, type: 'Water', description: 'Devastating water attack' }
    ],
    hp: 100,
    maxHp: 100,
    attack: 35,
    defense: 28,
    speed: 32,
    fusionPower: 75
  },

  // Air Element Slugs
  'arachnet': {
    name: 'Arachnet',
    image: 'https://slugterra.fandom.com/wiki/Special:FilePath/Arachnet.png',
    element: 'Air',
    rarity: 'uncommon',
    moves: [
      { name: 'Web Shot', damage: 15, type: 'Air', description: 'Traps opponent in webs' },
      { name: 'Wind Slice', damage: 22, type: 'Air', description: 'Sharp air blade attack' },
      { name: 'Spider Swarm', damage: 25, type: 'Air', description: 'Multiple small attacks' }
    ],
    hp: 75,
    maxHp: 75,
    attack: 20,
    defense: 18,
    speed: 40,
    fusionPower: 50
  },

  // Earth Element Slugs
  'rammstone': {
    name: 'Rammstone',
    image: 'https://slugterra.fandom.com/wiki/Special:FilePath/Rammstone.png',
    element: 'Earth',
    rarity: 'common',
    moves: [
      { name: 'Rock Slam', damage: 25, type: 'Earth', description: 'Powerful ramming attack' },
      { name: 'Stone Throw', damage: 20, type: 'Earth', description: 'Hurls rocks at opponent' },
      { name: 'Earthquake', damage: 30, type: 'Earth', description: 'Shakes the ground violently' }
    ],
    hp: 95,
    maxHp: 95,
    attack: 30,
    defense: 35,
    speed: 15,
    fusionPower: 65
  },

  // Energy Element Slugs
  'enigmo': {
    name: 'Enigmo',
    image: 'https://slugterra.fandom.com/wiki/Special:FilePath/Enigmo.png',
    element: 'Energy',
    rarity: 'rare',
    moves: [
      { name: 'Energy Blast', damage: 30, type: 'Energy', description: 'Pure energy attack' },
      { name: 'Power Surge', damage: 35, type: 'Energy', description: 'Overwhelming energy wave' },
      { name: 'Quantum Strike', damage: 40, type: 'Energy', description: 'Reality-bending attack' }
    ],
    hp: 90,
    maxHp: 90,
    attack: 38,
    defense: 25,
    speed: 35,
    fusionPower: 80
  }
};

// Ghoul versions of slugs
export const GHOUL_DATABASE: Record<string, Omit<Slug, 'level' | 'xp' | 'maxXp'>> = {
  'grimmstone': {
    name: 'Grimmstone',
    image: 'https://slugterra.fandom.com/wiki/Special:FilePath/Grimmstone.png',
    element: 'Earth',
    rarity: 'rare',
    moves: [
      { name: 'Dark Slam', damage: 30, type: 'Dark', description: 'Corrupted ramming attack' },
      { name: 'Shadow Stone', damage: 25, type: 'Dark', description: 'Throws dark energy rocks' },
      { name: 'Ghoul Quake', damage: 35, type: 'Dark', description: 'Dark earthquake attack' }
    ],
    hp: 100,
    maxHp: 100,
    attack: 35,
    defense: 30,
    speed: 20,
    isGhoul: true,
    fusionPower: 70
  }
};

export const getAllSlugs = (): Record<string, Omit<Slug, 'level' | 'xp' | 'maxXp'>> => {
  return { ...SLUG_DATABASE, ...GHOUL_DATABASE };
};

export const getRandomSlug = (includeGhouls: boolean = false): string => {
  const slugs = includeGhouls ? getAllSlugs() : SLUG_DATABASE;
  const slugNames = Object.keys(slugs);
  return slugNames[Math.floor(Math.random() * slugNames.length)];
};

export const createSlugInstance = (slugKey: string, level: number = 1): Slug => {
  const baseSlug = getAllSlugs()[slugKey];
  if (!baseSlug) {
    throw new Error(`Slug ${slugKey} not found in database`);
  }

  const levelMultiplier = 1 + (level - 1) * 0.1;
  const maxXp = level * 100;

  return {
    ...baseSlug,
    level,
    xp: 0,
    maxXp,
    hp: Math.floor(baseSlug.hp * levelMultiplier),
    maxHp: Math.floor(baseSlug.maxHp * levelMultiplier),
    attack: Math.floor(baseSlug.attack * levelMultiplier),
    defense: Math.floor(baseSlug.defense * levelMultiplier),
    speed: Math.floor(baseSlug.speed * levelMultiplier)
  };
};