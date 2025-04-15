
import { Pokemon } from "@/components/chat/PlayerInfo";

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
  let damage = (((2 * attacker.level) / 5 + 2) * move.power * (attacker.level / defender.level)) / 50;

  // Add randomness (85-100% of calculated damage)
  const randomFactor = 0.85 + Math.random() * 0.15;
  damage *= randomFactor;

  // Round to nearest integer
  return Math.max(1, Math.floor(damage));
};

export const getMoveList = (pokemon: Pokemon): string[] => {
  // Generate move names based on Pokémon type or just provide generic moves
  const pokemonType = pokemon.type || getPokemonType(pokemon.name);
  
  // Common moves all Pokémon can have
  const commonMoves = ["Tackle", "Quick Attack"];
  
  // Type-specific moves
  const typeMovesMap: Record<string, string[]> = {
    fire: ["Ember", "Fire Spin", "Flamethrower"],
    water: ["Water Gun", "Bubble", "Aqua Tail"],
    grass: ["Vine Whip", "Razor Leaf", "Seed Bomb"],
    electric: ["Thunder Shock", "Spark", "Thunderbolt"],
    normal: ["Scratch", "Pound", "Slam"],
    fighting: ["Karate Chop", "Low Kick", "Brick Break"],
    flying: ["Gust", "Wing Attack", "Air Slash"],
    poison: ["Poison Sting", "Acid", "Sludge"],
    ground: ["Sand Attack", "Mud Shot", "Earthquake"],
    rock: ["Rock Throw", "Rock Slide", "Stone Edge"],
    bug: ["Bug Bite", "Fury Cutter", "X-Scissor"],
    ghost: ["Lick", "Shadow Ball", "Shadow Claw"],
    steel: ["Metal Claw", "Iron Tail", "Flash Cannon"],
    psychic: ["Confusion", "Psybeam", "Psychic"],
    ice: ["Ice Shard", "Ice Beam", "Blizzard"],
    dragon: ["Dragon Rage", "Dragon Claw", "Outrage"],
    dark: ["Bite", "Crunch", "Dark Pulse"],
    fairy: ["Fairy Wind", "Dazzling Gleam", "Moonblast"]
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
    bulbasaur: "grass",
    charmander: "fire",
    squirtle: "water",
    pikachu: "electric",
    // Add more as needed
  };
  
  return typeMap[name.toLowerCase()] || "normal";
};

// Calculate health for a Pokémon based on level
export const calculateMaxHealth = (pokemon: Pokemon): number => {
  // Base HP + level-based bonus
  return 20 + (pokemon.level * 5);
};

// Get an effective stab (Same Type Attack Bonus) multiplier
export const getTypeEffectiveness = (moveType: string, defenderType: string): number => {
  // Super effective matchups (simplified)
  const typeChart: Record<string, string[]> = {
    fire: ["grass", "ice", "bug", "steel"],
    water: ["fire", "ground", "rock"],
    grass: ["water", "ground", "rock"],
    electric: ["water", "flying"],
    fighting: ["normal", "ice", "rock", "dark", "steel"],
    flying: ["grass", "fighting", "bug"],
    poison: ["grass", "fairy"],
    ground: ["fire", "electric", "poison", "rock", "steel"],
    rock: ["fire", "ice", "flying", "bug"],
    bug: ["grass", "psychic", "dark"],
    ghost: ["psychic", "ghost"],
    steel: ["ice", "rock", "fairy"],
    psychic: ["fighting", "poison"],
    ice: ["grass", "ground", "flying", "dragon"],
    dragon: ["dragon"],
    dark: ["psychic", "ghost"],
    fairy: ["fighting", "dragon", "dark"]
  };

  // If the move type is super effective against the defender type
  if (typeChart[moveType]?.includes(defenderType)) {
    return 1.5; // Super effective
  }

  return 1.0; // Normal effectiveness
};
