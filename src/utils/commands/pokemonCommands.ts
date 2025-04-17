
import { PlayerData, Pokemon } from '@/types/gameTypes';

export const handleCatchCommand = (
  playerData: PlayerData,
  setPlayerData: (data: PlayerData) => void,
  broadcast: (text: string) => void,
  ballType?: string
) => {
  console.log("Catch command called with lastSpawn:", playerData.lastSpawn);
  
  if (!playerData.lastSpawn) {
    broadcast("No Pokémon to catch! Use /spawn first.");
    return;
  }
  
  const ball = ballType?.toLowerCase() || 'pokeball';
  const validBalls = ['pokeball', 'greatball', 'ultraball', 'masterball'];
  
  if (!validBalls.includes(ball)) {
    broadcast(`Invalid ball type. Use: ${validBalls.join(', ')}`);
    return;
  }
  
  if (!playerData.inventory[ball as keyof typeof playerData.inventory] || 
      playerData.inventory[ball as keyof typeof playerData.inventory] <= 0) {
    broadcast(`You don't have any ${ball}s! Buy some from the shop with /shop and /buy.`);
    return;
  }
  
  const catchRates: Record<string, number> = {
    pokeball: 0.5,
    greatball: 0.7,
    ultraball: 0.9,
    masterball: 1.0
  };
  
  const success = Math.random() < catchRates[ball];
  
  // Make a copy of playerData to modify
  const updatedPlayerData = { ...playerData };
  
  // Decrease ball count
  updatedPlayerData.inventory[ball as keyof typeof updatedPlayerData.inventory] -= 1;
  
  if (success) {
    // Ensure party array exists
    if (!updatedPlayerData.party) {
      updatedPlayerData.party = [];
    }
    
    if (updatedPlayerData.party.length < 6) {
      updatedPlayerData.party.push(updatedPlayerData.lastSpawn as Pokemon);
      broadcast(`You caught ${updatedPlayerData.lastSpawn?.name}! Added to your party.`);
    } else {
      // Ensure PC array exists
      if (!updatedPlayerData.pc) {
        updatedPlayerData.pc = [];
      }
      updatedPlayerData.pc.push(updatedPlayerData.lastSpawn as Pokemon);
      broadcast(`Party full! ${updatedPlayerData.lastSpawn?.name} was sent to PC.`);
    }
  } else {
    broadcast(`Oh no! ${updatedPlayerData.lastSpawn?.name} broke free and ran away!`);
  }
  
  // Clear the lastSpawn after processing
  updatedPlayerData.lastSpawn = null;
  
  // Update player data with the modified copy
  setPlayerData(updatedPlayerData);
};

export const handleSpawnCommand = async (
  playerData: PlayerData,
  setPlayerData: (data: PlayerData) => void,
  broadcast: (text: string, image?: string | null) => void
) => {
  try {
    const randomId = Math.floor(Math.random() * 151) + 1;
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch Pokemon: ${response.status}`);
    }
    
    const data = await response.json();
    
    const pokemon: Pokemon = {
      name: data.name,
      image: data.sprites.other["official-artwork"].front_default,
      level: Math.floor(Math.random() * 5) + 1,
      xp: 0,
      moves: data.moves.slice(0, 4).map((m: any) => m.move.name)
    };
    
    // Create a new object to avoid mutation issues
    const updatedPlayerData = { ...playerData };
    updatedPlayerData.lastSpawn = pokemon;
    
    // Update player data with the modified copy
    setPlayerData(updatedPlayerData);
    
    broadcast(`A wild ${pokemon.name} appeared!`, pokemon.image);
    
    console.log("Setting lastSpawn to:", pokemon);
    
  } catch (error) {
    console.error("Error spawning Pokémon:", error);
    broadcast("Error spawning Pokémon. Please try again.");
  }
};
