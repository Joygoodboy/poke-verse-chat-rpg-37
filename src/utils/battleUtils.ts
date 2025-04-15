
// Utility functions for Pokemon battles

export const calculateDamage = (attacker, attackerMove, defender) => {
  // Basic damage formula similar to Pokémon games
  const level = attacker.level;
  const power = attackerMove.power;
  const attack = 5 + (level * 2);
  const defense = 5 + (defender.level * 1.5);
  
  // Base damage calculation
  let damage = Math.floor(((2 * level / 5 + 2) * power * attack / defense) / 50) + 2;
  
  // Add randomness (85-100% of calculated damage)
  const multiplier = 0.85 + (Math.random() * 0.15);
  damage = Math.floor(damage * multiplier);
  
  return damage;
};

export const getTypeEffectiveness = (moveType, defenderType) => {
  const typeChart = {
    normal: { rock: 0.5, ghost: 0, steel: 0.5 },
    fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
    water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
    electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
    grass: { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
    ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
    fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
    poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
    ground: { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
    flying: { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
    psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
    bug: { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
    rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
    ghost: { normal: 0, fighting: 0, poison: 0.5, bug: 0.5, ghost: 2, dark: 0.5 },
    dragon: { dragon: 2, steel: 0.5, fairy: 0 },
    dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
    steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
    fairy: { fighting: 2, poison: 0.5, bug: 0.5, dragon: 2, dark: 2, steel: 0.5 }
  };
  
  // Default to neutral damage
  if (!typeChart[moveType.toLowerCase()] || !defenderType) return 1;
  
  return typeChart[moveType.toLowerCase()][defenderType.toLowerCase()] || 1;
};

export const getMoveDescription = (move) => {
  const descriptions = {
    tackle: "A physical attack in which the user charges and slams into the target with its whole body.",
    ember: "The target is attacked with small flames. This may also leave the target with a burn.",
    waterGun: "The target is blasted with a forceful shot of water.",
    thunderShock: "A jolt of electricity is hurled at the target to inflict damage.",
    vineWhip: "The target is struck with slender, whiplike vines.",
    quickAttack: "The user lunges at the target at a speed that makes it almost invisible.",
    bite: "The target is bitten with viciously sharp fangs.",
    scratch: "Hard, pointed, sharp claws rake the target to inflict damage.",
    pound: "The target is physically pounded with a long tail, a foreleg, or the like.",
    karatechop: "The target is attacked with a sharp chop. Critical hits land more easily.",
    bodyslam: "The user drops onto the target with its full body weight.",
  };
  
  return descriptions[move.toLowerCase()] || "The Pokémon attacks the target.";
};

export const generateRandomPokemonType = () => {
  const types = [
    "normal", "fire", "water", "electric", "grass", "ice", 
    "fighting", "poison", "ground", "flying", "psychic", 
    "bug", "rock", "ghost", "dragon", "dark", "steel", "fairy"
  ];
  
  return types[Math.floor(Math.random() * types.length)];
};

export const getTypeColor = (type) => {
  const typeColors = {
    normal: "#A8A878",
    fire: "#F08030",
    water: "#6890F0",
    electric: "#F8D030",
    grass: "#78C850",
    ice: "#98D8D8",
    fighting: "#C03028",
    poison: "#A040A0",
    ground: "#E0C068",
    flying: "#A890F0",
    psychic: "#F85888",
    bug: "#A8B820",
    rock: "#B8A038",
    ghost: "#705898",
    dragon: "#7038F8",
    dark: "#705848",
    steel: "#B8B8D0",
    fairy: "#EE99AC"
  };
  
  return typeColors[type.toLowerCase()] || "#68A090";
};
