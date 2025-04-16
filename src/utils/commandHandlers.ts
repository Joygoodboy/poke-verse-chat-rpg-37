
import { PlayerData, Pokemon } from '@/types/gameTypes';
import { ref, push, set, get } from 'firebase/database';
import { db } from '../firebase';

export const handleLeaderboardCommand = async (broadcast: (text: string) => void) => {
  const playersRef = ref(db, "players");
  const snapshot = await get(playersRef);
  
  if (!snapshot.exists()) {
    broadcast("No players found for leaderboard yet.");
    return;
  }

  const allPlayers = snapshot.val();
  const playerWealthList = Object.entries(allPlayers).map(([name, data]: [string, any]) => ({
    name,
    totalWealth: (data.wallet || 0) + (data.bank || 0)
  }));

  playerWealthList.sort((a, b) => b.totalWealth - a.totalWealth);

  let leaderboardText = "🏆 **Richest Players Leaderboard** 🏆\n\n";
  playerWealthList.slice(0, 10).forEach((player, index) => {
    const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}.`;
    leaderboardText += `${medal} ${player.name}: ${player.totalWealth} coins\n`;
  });

  broadcast(leaderboardText);
};

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
  
  setPlayerData(prev => {
    const updated = { ...prev };
    updated.inventory[ball as keyof typeof updated.inventory] -= 1;
    
    if (success) {
      if (updated.party.length < 6) {
        updated.party.push(updated.lastSpawn as Pokemon);
        broadcast(`You caught ${updated.lastSpawn?.name}! Added to your party.`);
      } else {
        if (!updated.pc) updated.pc = [];
        updated.pc.push(updated.lastSpawn as Pokemon);
        broadcast(`Party full! ${updated.lastSpawn?.name} was sent to PC.`);
      }
      updated.lastSpawn = null;
    } else {
      broadcast(`Oh no! ${updated.lastSpawn?.name} broke free and ran away!`);
      updated.lastSpawn = null;
    }
    
    return updated;
  });
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
    
    setPlayerData(prev => ({
      ...prev,
      lastSpawn: pokemon
    }));
    
    broadcast(`A wild ${pokemon.name} appeared!`, pokemon.image);
    
    console.log("Setting lastSpawn to:", pokemon);
    
  } catch (error) {
    console.error("Error spawning Pokémon:", error);
    broadcast("Error spawning Pokémon. Please try again.");
  }
};

export const handleHelpCommand = (broadcast: (text: string) => void) => {
  const helpText = `
📖 **Available Commands:**

**💰 Economy:**
/wallet - Check your wallet balance
/bank [deposit/withdraw/interest] [amount] - Bank operations
/daily - Claim daily reward
/slot - Play the slot machine (costs 50 coins)
/shop - View items for sale
/buy [item] - Purchase an item
/lb - Show leaderboard of richest players
/rob [username] - Try to rob another player (risky!)

**🎮 Pokémon:**
/spawn - Spawn a random Pokémon
/catch [ball-type] - Try to catch a spawned Pokémon
/party - Check your Pokémon party
/pc - View Pokémon in your PC
/t2pc [index] - Transfer Pokémon to PC
/t2party [index] - Transfer Pokémon to party
/rb - Start a random battle
/release [index] - Release a Pokémon

**⚔️ Battle:**
/pokemonchallenge [username] or /pch [username] - Challenge player
/challenge accept or /ch accept - Accept a challenge
/battle [move-number] - Use a move in battle
/forfeit - Give up the battle

**👑 Admin:**
/ban [username] - Ban a user (admin only)
/unban [username] - Unban a user (admin only)
/owner - See who owns the game
/mods - See who moderates the game
`;
  broadcast(helpText);
};
