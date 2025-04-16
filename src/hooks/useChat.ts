
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
      handleCatchCommand(playerData, setPlayerData, broadcast, args[1]);
      return;
    } else if (command === 'spawn') {
      handleSpawnCommand(playerData, setPlayerData, broadcast);
      return;
    }
    
    if (text.startsWith('/')) {
      return;
    }
  };

  const commandSystemRef = createCommandSystem(playerData, setPlayerData);

  return {
    messages,
    playerData,
    setPlayerData,
    broadcast,
    commandSystemRef,
    handleCommand
  };
};
