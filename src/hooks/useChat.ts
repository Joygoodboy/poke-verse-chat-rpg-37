
import { usePlayerData } from './usePlayerData';
import { useChatMessages } from './useChatMessages';
import { handleHelpCommand, handleLeaderboardCommand, handleCatchCommand, handleSpawnCommand } from '../utils/commandHandlers';
import { createCommandSystem } from '../utils/gameCommands';

export const OWNER_LIST = ["joyhostingbsite.com@gmail.com", "good", "Ash", "admin@pokemon.com", "owner@pokemon.com"];
export const ADMIN_LIST = ["Gary", "Professor Oak", "mod@pokemon.com", "moderator@pokemon.com"];

export const useChat = (username: string) => {
  const { playerData, setPlayerData } = usePlayerData(username);
  const { messages, broadcast: broadcastMessage } = useChatMessages();
  
  const broadcast = (text: string, image: string | null = null) => {
    broadcastMessage(username, text, image);
  };

  const handleCommand = (text: string) => {
    const args = text.split(" ");
    const command = args[0].toLowerCase().replace('/', '');
    
    if (command === 'help') {
      handleHelpCommand(broadcast);
      return;
    } else if (command === 'lb' || command === 'leaderboard') {
      handleLeaderboardCommand(broadcast);
      return;
    } else if (command === 'catch') {
      const ballType = args.length > 1 ? args[1] : undefined;
      if (playerData.lastSpawn) {
        console.log("Catch command called with lastSpawn:", playerData.lastSpawn);
        handleCatchCommand(playerData, setPlayerData, broadcast, ballType);
      } else {
        console.log("No Pokemon to catch, current playerData:", playerData);
        broadcast("No Pokémon to catch! Use /spawn first.");
      }
      return;
    } else if (command === 'spawn') {
      handleSpawnCommand(playerData, setPlayerData, broadcast);
      return;
    } else if (command === 'selectpokemon' || command === 'select') {
      const pokemonIndex = parseInt(args[1]);
      if (isNaN(pokemonIndex) || pokemonIndex < 0 || pokemonIndex >= (playerData.party?.length || 0)) {
        broadcast("Invalid Pokémon selection. Use /select [number] with a valid party Pokémon index.");
        return;
      }
      broadcast(`You selected ${playerData.party[pokemonIndex].name} for battle!`);
      return;
    }
    
    if (text.startsWith('/')) {
      return;
    }
  };

  // Safely initialize command system with error handling
  let commandSystemRef;
  try {
    commandSystemRef = createCommandSystem(playerData, setPlayerData);
  } catch (error) {
    console.error("Error initializing command system:", error);
    // Provide a fallback empty command system
    commandSystemRef = {};
  }

  return {
    messages,
    playerData,
    setPlayerData,
    broadcast,
    commandSystemRef,
    handleCommand
  };
};
