import { usePlayerData } from './usePlayerData';
import { useChatMessages } from './useChatMessages';
import { 
  handleHelpCommand, 
  handleLeaderboardCommand, 
  handleCatchCommand, 
  handleSpawnCommand,
  handleClearChatCommand,
  handleLogoutCommand
} from '../utils/commandHandlers';
import { createCommandSystem } from '../utils/gameCommands';
import { useNavigate } from 'react-router-dom';

export const OWNER_LIST = ["joyhostingbsite.com@gmail.com", "joyhoswebsite@gmail.com", "good", "Ash", "admin@pokemon.com", "owner@pokemon.com"];
export const ADMIN_LIST = ["Gary", "Professor Oak", "mod@pokemon.com", "moderator@pokemon.com"];

export const useChat = (username: string) => {
  const { playerData, setPlayerData } = usePlayerData(username);
  const { messages, broadcast: broadcastMessage } = useChatMessages();
  const navigate = useNavigate();
  
  const logout = () => {
    localStorage.removeItem("loggedInUser");
    navigate("/login");
  };
  
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
    } else if (command === 'clearchat') {
      const isAdmin = ADMIN_LIST.includes(username) || OWNER_LIST.includes(username);
      handleClearChatCommand(username, isAdmin, broadcast);
      return;
    } else if (command === 'logout') {
      handleLogoutCommand(broadcast, logout);
      return;
    }
    
    if (text.startsWith('/')) {
      return;
    }
  };

  let commandSystemRef;
  try {
    commandSystemRef = createCommandSystem(playerData, setPlayerData);
  } catch (error) {
    console.error("Error initializing command system:", error);
    commandSystemRef = {};
  }

  return {
    messages,
    playerData,
    setPlayerData,
    broadcast,
    commandSystemRef,
    handleCommand,
    logout
  };
};
