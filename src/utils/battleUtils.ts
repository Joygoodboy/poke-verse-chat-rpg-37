
import { Pokemon } from "@/components/chat/PlayerInfo";

// Calculate damage for a Pokémon attack
export const calculateDamage = (
  attacker: Pokemon,
  defender: Pokemon,
  moveIndex: number
): number => {
  // Basic moves every Pokémon can use
  const basicMoves = [
    { name: "Tackle", power: 40, type: "normal" },
    { name: "Quick Attack", power: 35, type: "normal" },
    { name: "Scratch", power: 40, type: "normal" },
    { name: "Pound", power: 40, type: "normal" }
  ];

  // Get move based on index, or use a default move
  const move = basicMoves[moveIndex] || basicMoves[0];

  // Base damage calculation
  let damage = (((2 * attacker.level) / 5 + 2) * move.power * (attacker.attack / defender.defense)) / 50;

  // Type effectiveness
  const effectiveness = getTypeEffectiveness(move.type, defender.type || getPokemonType(defender.name));
  damage *= effectiveness;

  // Same Type Attack Bonus (STAB)
  if (move.type === attacker.type || move.type === getPokemonType(attacker.name)) {
    damage *= 1.5;
  }

  // Critical hit (6.25% chance)
  const isCritical = Math.random() < 0.0625;
  if (isCritical) {
    damage *= 1.5;
  }

  // Add randomness (85-100% of calculated damage)
  const randomFactor = 0.85 + Math.random() * 0.15;
  damage *= randomFactor;

  // Round to nearest integer
  return {
    damage: Math.max(1, Math.floor(damage)),
    isCritical,
    effectiveness
  };
};

export const getMoveList = (pokemon: Pokemon): string[] => {
  // Generate move names based on Pokémon type or just provide generic moves
  const pokemonType = pokemon.type || getPokemonType(pokemon.name);
  
  // Common moves all Pokémon can have
  const commonMoves = ["Tackle", "Quick Attack"];
  
  // Type-specific moves
  const typeMovesMap: Record<string, string[]> = {
    fire: ["Ember", "Fire Spin", "Flamethrower", "Fire Blast"],
    water: ["Water Gun", "Bubble", "Aqua Tail", "Hydro Pump"],
    grass: ["Vine Whip", "Razor Leaf", "Seed Bomb", "Solar Beam"],
    electric: ["Thunder Shock", "Spark", "Thunderbolt", "Thunder"],
    normal: ["Scratch", "Pound", "Slam", "Hyper Beam"],
    fighting: ["Karate Chop", "Low Kick", "Brick Break", "Close Combat"],
    flying: ["Gust", "Wing Attack", "Air Slash", "Hurricane"],
    poison: ["Poison Sting", "Acid", "Sludge", "Gunk Shot"],
    ground: ["Sand Attack", "Mud Shot", "Earthquake", "Earth Power"],
    rock: ["Rock Throw", "Rock Slide", "Stone Edge", "Rock Wrecker"],
    bug: ["Bug Bite", "Fury Cutter", "X-Scissor", "Megahorn"],
    ghost: ["Lick", "Shadow Ball", "Shadow Claw", "Phantom Force"],
    steel: ["Metal Claw", "Iron Tail", "Flash Cannon", "Meteor Mash"],
    psychic: ["Confusion", "Psybeam", "Psychic", "Future Sight"],
    ice: ["Ice Shard", "Ice Beam", "Blizzard", "Freeze-Dry"],
    dragon: ["Dragon Rage", "Dragon Claw", "Outrage", "Draco Meteor"],
    dark: ["Bite", "Crunch", "Dark Pulse", "Night Slash"],
    fairy: ["Fairy Wind", "Dazzling Gleam", "Moonblast", "Play Rough"]
  };
  
  // Get moves for this Pokémon's type
  const typeMoves = typeMovesMap[pokemonType] || typeMovesMap.normal;
  
  // Return a combination of common moves and type-specific moves
  return [...commonMoves, ...typeMoves.slice(0, 2)];
};

// Get Pokémon type based on name (simplified version)
export const getPokemonType = (name: string): string => {
  // This is a simplified version - in a real app you'd use an API or database
  const typeMap: Record<string, string> = {
    bulbasaur: "grass", ivysaur: "grass", venusaur: "grass",
    charmander: "fire", charmeleon: "fire", charizard: "fire",
    squirtle: "water", wartortle: "water", blastoise: "water",
    pikachu: "electric", raichu: "electric",
    vulpix: "fire", ninetales: "fire",
    jigglypuff: "fairy", wigglytuff: "fairy",
    zubat: "flying", golbat: "flying",
    oddish: "grass", gloom: "grass", vileplume: "grass",
    meowth: "normal", persian: "normal",
    psyduck: "water", golduck: "water",
    growlithe: "fire", arcanine: "fire",
    poliwag: "water", poliwhirl: "water", poliwrath: "water",
    abra: "psychic", kadabra: "psychic", alakazam: "psychic",
    machop: "fighting", machoke: "fighting", machamp: "fighting",
    tentacool: "water", tentacruel: "water",
    geodude: "rock", graveler: "rock", golem: "rock",
    ponyta: "fire", rapidash: "fire",
    slowpoke: "water", slowbro: "water",
    magnemite: "electric", magneton: "electric",
    farfetchd: "flying",
    doduo: "flying", dodrio: "flying",
    seel: "water", dewgong: "water",
    grimer: "poison", muk: "poison",
    shellder: "water", cloyster: "water",
    gastly: "ghost", haunter: "ghost", gengar: "ghost",
    onix: "rock",
    drowzee: "psychic", hypno: "psychic",
    krabby: "water", kingler: "water",
    voltorb: "electric", electrode: "electric",
    exeggcute: "grass", exeggutor: "grass",
    cubone: "ground", marowak: "ground",
    hitmonlee: "fighting", hitmonchan: "fighting",
    lickitung: "normal",
    koffing: "poison", weezing: "poison",
    rhyhorn: "ground", rhydon: "ground",
    chansey: "normal",
    tangela: "grass",
    horsea: "water", seadra: "water",
    goldeen: "water", seaking: "water",
    staryu: "water", starmie: "water",
    mr_mime: "psychic",
    scyther: "bug",
    jynx: "ice",
    electabuzz: "electric",
    magmar: "fire",
    pinsir: "bug",
    tauros: "normal",
    magikarp: "water", gyarados: "water",
    lapras: "water",
    ditto: "normal",
    eevee: "normal", vaporeon: "water", jolteon: "electric", flareon: "fire",
    porygon: "normal",
    omanyte: "rock", omastar: "rock",
    kabuto: "rock", kabutops: "rock",
    aerodactyl: "rock",
    snorlax: "normal",
    articuno: "ice", zapdos: "electric", moltres: "fire",
    dratini: "dragon", dragonair: "dragon", dragonite: "dragon",
    mewtwo: "psychic", mew: "psychic"
  };
  
  return typeMap[name.toLowerCase()] || "normal";
};

// Calculate health for a Pokémon based on level
export const calculateMaxHealth = (pokemon: Pokemon): number => {
  // Base HP + level-based bonus (higher level = more HP)
  // For simplicity, we'll start with a base of 20 and add 5 per level
  // In a real game, this would be calculated based on base stats, IVs, and EVs
  return 20 + (pokemon.level * 5);
};

// Get an effective stab (Same Type Attack Bonus) multiplier
export const getTypeEffectiveness = (moveType: string, defenderType: string): number => {
  // Super effective matchups (simplified)
  const typeChart: Record<string, { superEffective: string[], notVeryEffective: string[], immune: string[] }> = {
    normal: {
      superEffective: [],
      notVeryEffective: ["rock", "steel"],
      immune: ["ghost"]
    },
    fire: {
      superEffective: ["grass", "ice", "bug", "steel"],
      notVeryEffective: ["fire", "water", "rock", "dragon"],
      immune: []
    },
    water: {
      superEffective: ["fire", "ground", "rock"],
      notVeryEffective: ["water", "grass", "dragon"],
      immune: []
    },
    grass: {
      superEffective: ["water", "ground", "rock"],
      notVeryEffective: ["fire", "grass", "poison", "flying", "bug", "dragon", "steel"],
      immune: []
    },
    electric: {
      superEffective: ["water", "flying"],
      notVeryEffective: ["electric", "grass", "dragon"],
      immune: ["ground"]
    },
    ice: {
      superEffective: ["grass", "ground", "flying", "dragon"],
      notVeryEffective: ["fire", "water", "ice", "steel"],
      immune: []
    },
    fighting: {
      superEffective: ["normal", "ice", "rock", "dark", "steel"],
      notVeryEffective: ["poison", "flying", "psychic", "bug", "fairy"],
      immune: ["ghost"]
    },
    poison: {
      superEffective: ["grass", "fairy"],
      notVeryEffective: ["poison", "ground", "rock", "ghost"],
      immune: ["steel"]
    },
    ground: {
      superEffective: ["fire", "electric", "poison", "rock", "steel"],
      notVeryEffective: ["grass", "bug"],
      immune: ["flying"]
    },
    flying: {
      superEffective: ["grass", "fighting", "bug"],
      notVeryEffective: ["electric", "rock", "steel"],
      immune: []
    },
    psychic: {
      superEffective: ["fighting", "poison"],
      notVeryEffective: ["psychic", "steel"],
      immune: ["dark"]
    },
    bug: {
      superEffective: ["grass", "psychic", "dark"],
      notVeryEffective: ["fire", "fighting", "poison", "flying", "ghost", "steel", "fairy"],
      immune: []
    },
    rock: {
      superEffective: ["fire", "ice", "flying", "bug"],
      notVeryEffective: ["fighting", "ground", "steel"],
      immune: []
    },
    ghost: {
      superEffective: ["psychic", "ghost"],
      notVeryEffective: ["dark"],
      immune: ["normal"]
    },
    dragon: {
      superEffective: ["dragon"],
      notVeryEffective: ["steel"],
      immune: ["fairy"]
    },
    dark: {
      superEffective: ["psychic", "ghost"],
      notVeryEffective: ["fighting", "dark", "fairy"],
      immune: []
    },
    steel: {
      superEffective: ["ice", "rock", "fairy"],
      notVeryEffective: ["fire", "water", "electric", "steel"],
      immune: []
    },
    fairy: {
      superEffective: ["fighting", "dragon", "dark"],
      notVeryEffective: ["fire", "poison", "steel"],
      immune: []
    }
  };

  const effectiveness = typeChart[moveType.toLowerCase()] || { superEffective: [], notVeryEffective: [], immune: [] };

  // Check immunity first
  if (effectiveness.immune.includes(defenderType.toLowerCase())) {
    return 0; // No damage
  }
  
  // Check super effectiveness
  if (effectiveness.superEffective.includes(defenderType.toLowerCase())) {
    return 2.0; // Super effective (double damage)
  }
  
  // Check not very effective
  if (effectiveness.notVeryEffective.includes(defenderType.toLowerCase())) {
    return 0.5; // Not very effective (half damage)
  }
  
  // Normal effectiveness
  return 1.0;
};

// Generate a random Pokémon for battles or encounters
export const generateRandomPokemon = (minLevel: number = 1, maxLevel: number = 10): Pokemon => {
  // List of common Pokémon for random encounters
  const commonPokemon = [
    "Pidgey", "Rattata", "Caterpie", "Weedle", "Oddish", 
    "Zubat", "Paras", "Spearow", "Ekans", "Sandshrew",
    "Nidoran", "Jigglypuff", "Diglett", "Meowth", "Poliwag",
    "Bellsprout", "Tentacool", "Geodude", "Magnemite", "Grimer"
  ];
  
  const rareChance = Math.random();
  let pokemonPool = commonPokemon;
  
  // 10% chance to encounter a rare Pokémon
  if (rareChance < 0.1) {
    const rarePokemon = [
      "Pikachu", "Vulpix", "Growlithe", "Abra", "Machop",
      "Ponyta", "Slowpoke", "Farfetch'd", "Seel", "Shellder",
      "Gastly", "Drowzee", "Krabby", "Voltorb", "Cubone",
      "Hitmonlee", "Koffing", "Rhyhorn", "Chansey", "Tangela"
    ];
    pokemonPool = rarePokemon;
  }
  
  // 1% chance to encounter a very rare Pokémon
  if (rareChance < 0.01) {
    const veryRarePokemon = [
      "Bulbasaur", "Charmander", "Squirtle", "Lapras", "Snorlax",
      "Dratini", "Scyther", "Jynx", "Electabuzz", "Magmar",
      "Pinsir", "Tauros", "Gyarados", "Lapras", "Eevee"
    ];
    pokemonPool = veryRarePokemon;
  }
  
  // 0.1% chance to encounter a legendary Pokémon
  if (rareChance < 0.001) {
    const legendaryPokemon = [
      "Articuno", "Zapdos", "Moltres", "Mewtwo", "Mew"
    ];
    pokemonPool = legendaryPokemon;
  }
  
  // Select a random Pokémon from the pool
  const randomIndex = Math.floor(Math.random() * pokemonPool.length);
  const pokemonName = pokemonPool[randomIndex];
  
  // Generate a random level within the specified range
  const level = Math.floor(Math.random() * (maxLevel - minLevel + 1)) + minLevel;
  
  // Get the type based on the Pokémon name
  const type = getPokemonType(pokemonName.toLowerCase());
  
  // Generate base stats based on level
  const baseHp = 20 + (level * 5);
  const baseAttack = 10 + (level * 2);
  const baseDefense = 10 + (level * 2);
  const baseSpeed = 10 + (level * 2);
  
  // Add some randomness to stats
  const randomFactor = 0.8 + (Math.random() * 0.4); // 0.8 to 1.2
  
  return {
    name: pokemonName,
    level,
    type,
    hp: Math.floor(baseHp * randomFactor),
    maxHp: Math.floor(baseHp * randomFactor),
    attack: Math.floor(baseAttack * randomFactor),
    defense: Math.floor(baseDefense * randomFactor),
    speed: Math.floor(baseSpeed * randomFactor),
    moves: getMoveList({ name: pokemonName, level, type } as Pokemon).slice(0, 4),
    xp: 0
  };
};
