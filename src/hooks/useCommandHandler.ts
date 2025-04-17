
import { usePlayerData } from './usePlayerData';
import { 
  handleHelpCommand, 
  handleClearChatCommand,
  handleLogoutCommand
} from '../utils/commandHandlers';
import { createCommandSystem } from '../utils/gameCommands';

type CommandHandlerProps = {
  username: string;
  playerData: any;
  setPlayerData: any;
  broadcast: (text: string, image?: string | null) => void;
  logout: () => void;
  isAdmin: boolean;
  isOwner: boolean;
};

export const useCommandHandler = ({
  username,
  playerData,
  setPlayerData,
  broadcast,
  logout,
  isAdmin,
  isOwner
}: CommandHandlerProps) => {
  const handleCommand = (text: string) => {
    const args = text.split(" ");
    const command = args[0].toLowerCase().replace('/', '');
    
    if (command === 'help') {
      handleHelpCommand(broadcast);
      return;
    } else if (command === 'clearchat') {
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
    handleCommand,
    commandSystemRef
  };
};
