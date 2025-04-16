
// Utility to generate battle field images based on battle state
import { BattleState, BattlePokemon } from '@/hooks/usePokemonBattle';

// Base battlefield image
const BATTLEFIELD_BG = "public/lovable-uploads/a2a90023-ac44-46b6-a6d4-58cbb175e6f0.png";
const POKEDEX_BG = "public/lovable-uploads/783aeec4-e001-4598-884f-38da174c23c1.png";

// Generate HTML for a battle scene
export const generateBattleImage = (
  battle: BattleState,
  attackDetails?: {
    attacker: string;
    defender: string;
    moveName: string;
    damage: number;
    isCritical: boolean;
    effectiveness: number;
  }
): string => {
  if (!battle.challengerPokemon || !battle.opponentPokemon) {
    return `<div class="text-center text-gray-500">Waiting for Pokémon selection...</div>`;
  }

  const leftPokemon = battle.challengerPokemon;
  const rightPokemon = battle.opponentPokemon;
  
  // Calculate health percentages
  const leftHealthPercent = Math.max(0, (leftPokemon.health / leftPokemon.maxHealth) * 100);
  const rightHealthPercent = Math.max(0, (rightPokemon.health / rightPokemon.maxHealth) * 100);
  
  // Get health bar colors
  const getHealthColor = (percent: number) => {
    if (percent > 50) return "bg-green-500";
    if (percent > 20) return "bg-yellow-500";
    return "bg-red-500";
  };
  
  // Attack effect
  let attackEffect = '';
  if (attackDetails) {
    const effectivenessText = attackDetails.effectiveness > 1 
      ? "It's super effective!" 
      : attackDetails.effectiveness < 1 
        ? "It's not very effective..." 
        : "";
        
    const criticalText = attackDetails.isCritical ? "Critical hit!" : "";
    
    attackEffect = `
      <div class="absolute inset-0 flex items-center justify-center z-20">
        <div class="bg-black/75 text-white p-4 rounded-lg text-center max-w-xs animate-fade-in">
          <p class="text-xl font-bold">${attackDetails.attacker} used ${attackDetails.moveName}!</p>
          ${effectivenessText ? `<p class="text-yellow-300">${effectivenessText}</p>` : ''}
          ${criticalText ? `<p class="text-red-400">${criticalText}</p>` : ''}
          <p class="text-2xl font-bold mt-2">${attackDetails.damage} damage!</p>
        </div>
      </div>
    `;
  }

  return `
    <div class="relative w-full h-64 overflow-hidden rounded-lg border-4 border-gray-800 shadow-xl">
      <!-- Battle background -->
      <img src="${BATTLEFIELD_BG}" alt="Battlefield" class="absolute inset-0 w-full h-full object-cover" />
      
      <!-- Left Pokemon (Challenger) -->
      <div class="absolute bottom-4 left-8 z-10">
        <div class="mb-2 bg-gray-900/80 text-white p-1 rounded text-center text-sm">
          <div class="font-bold capitalize">${leftPokemon.name} Lv.${leftPokemon.level}</div>
          <div class="w-full h-2 bg-gray-700 rounded-full mt-1">
            <div class="${getHealthColor(leftHealthPercent)} h-2 rounded-full" style="width: ${leftHealthPercent}%"></div>
          </div>
          <div class="text-xs mt-1">${leftPokemon.health}/${leftPokemon.maxHealth} HP</div>
        </div>
        ${leftPokemon.image ? 
          `<img src="${leftPokemon.image}" alt="${leftPokemon.name}" class="w-24 h-24 object-contain ${battle.turn === battle.challenger ? 'animate-pulse' : ''}" />` :
          `<div class="w-24 h-24 bg-gray-500 rounded-full flex items-center justify-center">
            <span class="text-lg font-bold uppercase">${leftPokemon.name.charAt(0)}</span>
          </div>`
        }
      </div>
      
      <!-- Right Pokemon (Opponent) -->
      <div class="absolute bottom-4 right-8 z-10">
        <div class="mb-2 bg-gray-900/80 text-white p-1 rounded text-center text-sm">
          <div class="font-bold capitalize">${rightPokemon.name} Lv.${rightPokemon.level}</div>
          <div class="w-full h-2 bg-gray-700 rounded-full mt-1">
            <div class="${getHealthColor(rightHealthPercent)} h-2 rounded-full" style="width: ${rightHealthPercent}%"></div>
          </div>
          <div class="text-xs mt-1">${rightPokemon.health}/${rightPokemon.maxHealth} HP</div>
        </div>
        ${rightPokemon.image ? 
          `<img src="${rightPokemon.image}" alt="${rightPokemon.name}" class="w-24 h-24 object-contain ${battle.turn === battle.opponent ? 'animate-pulse' : ''}" />` :
          `<div class="w-24 h-24 bg-gray-500 rounded-full flex items-center justify-center">
            <span class="text-lg font-bold uppercase">${rightPokemon.name.charAt(0)}</span>
          </div>`
        }
      </div>
      
      <!-- Battle text -->
      <div class="absolute bottom-0 inset-x-0 bg-white/90 p-2 text-center text-sm">
        ${battle.logs[battle.logs.length-1] || "The battle is about to begin!"}
      </div>
      
      ${attackEffect}
    </div>
  `;
};

// Generate HTML for Pokédex entry
export const generatePokedexEntry = (pokemon: BattlePokemon): string => {
  if (!pokemon) {
    return `<div class="text-center text-gray-500">No Pokémon selected</div>`;
  }

  // Get type color
  const getTypeColor = (type: string) => {
    const typeColors: Record<string, string> = {
      normal: "bg-gray-400",
      fire: "bg-red-500",
      water: "bg-blue-500",
      grass: "bg-green-500",
      electric: "bg-yellow-400",
      ice: "bg-blue-200",
      fighting: "bg-red-700",
      poison: "bg-purple-500",
      ground: "bg-yellow-700",
      flying: "bg-indigo-300",
      psychic: "bg-pink-500",
      bug: "bg-green-600",
      rock: "bg-yellow-800",
      ghost: "bg-purple-700",
      dragon: "bg-indigo-600",
      steel: "bg-gray-500",
      fairy: "bg-pink-300"
    };
    
    return typeColors[type.toLowerCase()] || "bg-gray-400";
  };

  // Base stats calculation
  const baseHP = pokemon.maxHealth;
  const baseAtk = 10 + (pokemon.level * 2);
  const baseDef = 10 + (pokemon.level * 1.5);
  const baseSpd = 10 + (pokemon.level * 1.8);
  
  // Get move power display
  const getMoveDisplay = (move: { name: string, power: number, type: string, accuracy: number }) => {
    return `
      <div class="flex justify-between items-center border-b border-gray-200 py-1">
        <span class="capitalize">${move.name}</span>
        <div class="flex items-center space-x-2">
          <span class="text-xs ${getTypeColor(move.type)} text-white px-2 py-0.5 rounded">${move.type}</span>
          <span class="text-xs bg-gray-200 px-2 py-0.5 rounded">Power: ${move.power}</span>
          <span class="text-xs bg-gray-200 px-2 py-0.5 rounded">Acc: ${move.accuracy}%</span>
        </div>
      </div>
    `;
  };

  return `
    <div class="relative w-full max-w-lg mx-auto overflow-hidden rounded-lg border-4 border-yellow-500 bg-red-100 shadow-xl pb-4">
      <!-- Pokédex header -->
      <div class="relative overflow-hidden">
        <img src="${POKEDEX_BG}" alt="Pokédex" class="w-full object-contain" />
        <div class="absolute top-4 right-4 bg-red-600 text-white text-xs px-2 py-1 rounded-full">
          #${Math.floor(Math.random() * 151) + 1}
        </div>
      </div>
      
      <!-- Pokémon info -->
      <div class="p-4 bg-white rounded-t-xl -mt-8 relative z-10 mx-4 shadow-md">
        <div class="flex items-center">
          ${pokemon.image ? 
            `<img src="${pokemon.image}" alt="${pokemon.name}" class="w-20 h-20 object-contain mr-4" />` :
            `<div class="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mr-4">
              <span class="text-2xl font-bold uppercase">${pokemon.name.charAt(0)}</span>
            </div>`
          }
          <div>
            <h2 class="text-2xl font-bold capitalize">${pokemon.name}</h2>
            <div class="flex space-x-2 mt-1">
              <span class="text-xs ${getTypeColor(pokemon.type || 'normal')} text-white px-2 py-0.5 rounded uppercase">${pokemon.type || 'Normal'}</span>
              <span class="text-xs bg-gray-200 px-2 py-0.5 rounded">Level ${pokemon.level}</span>
            </div>
          </div>
        </div>
        
        <!-- Stats -->
        <div class="mt-4 grid grid-cols-2 gap-4">
          <div>
            <h3 class="font-bold text-sm text-gray-700 mb-2">Stats</h3>
            <div class="space-y-1 text-sm">
              <div class="flex justify-between">
                <span>HP:</span>
                <span>${pokemon.health}/${pokemon.maxHealth}</span>
              </div>
              <div class="flex justify-between">
                <span>Attack:</span>
                <span>${baseAtk}</span>
              </div>
              <div class="flex justify-between">
                <span>Defense:</span>
                <span>${baseDef}</span>
              </div>
              <div class="flex justify-between">
                <span>Speed:</span>
                <span>${baseSpd}</span>
              </div>
              <div class="flex justify-between">
                <span>XP:</span>
                <span>${pokemon.xp || 0}/${pokemon.level * 100}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 class="font-bold text-sm text-gray-700 mb-2">Experience</h3>
            <div class="w-full h-2 bg-gray-200 rounded-full">
              <div class="bg-blue-500 h-2 rounded-full" style="width: ${((pokemon.xp || 0) / (pokemon.level * 100)) * 100}%"></div>
            </div>
            <p class="text-xs text-gray-600 mt-2">Next level: ${pokemon.level * 100 - (pokemon.xp || 0)} XP needed</p>
          </div>
        </div>
        
        <!-- Moves -->
        <div class="mt-4">
          <h3 class="font-bold text-sm text-gray-700 mb-2">Moves</h3>
          <div class="space-y-1 text-sm">
            ${pokemon.moves.map(move => getMoveDisplay(move)).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
};
