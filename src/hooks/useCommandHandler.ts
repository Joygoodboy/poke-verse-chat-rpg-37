
import { usePlayerData } from './usePlayerData';
import { 
  handleHelpCommand, 
  handleClearChatCommand,
  handleLogoutCommand,
  handleGiveCoinsCommand,
  handleGivePokemonCommand,
  handleAnnouncementCommand,
  handleSlugSpawnCommand,
  handleSlugCatchCommand,
  handleSlugArsenalCommand,
  handleSlugHideoutCommand,
  handleSlugInfoCommand,
  handleSlugChallengeCommand,
  handleSlugBattleCommand,
  handleSlugTrainCommand,
  handleSlugFuseCommand
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
    
    // Handle basic commands
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
    
    // Handle Slugterra commands
    if (command === 'slugspawn') {
      handleSlugSpawnCommand(playerData, setPlayerData, broadcast);
      return;
    } else if (command === 'slugcatch') {
      handleSlugCatchCommand(playerData, setPlayerData, broadcast);
      return;
    } else if (command === 'slugarsenal' || command === 'arsenal') {
      handleSlugArsenalCommand(playerData, broadcast);
      return;
    } else if (command === 'slughideout' || command === 'hideout') {
      handleSlugHideoutCommand(playerData, broadcast);
      return;
    } else if (command === 'sluginfo') {
      const slugIndex = args[1];
      handleSlugInfoCommand(playerData, broadcast, slugIndex);
      return;
    } else if (command === 'slugchallenge' || command === 'slugduel') {
      const opponent = args[1];
      handleSlugChallengeCommand(playerData, setPlayerData, broadcast, opponent, username);
      return;
    } else if (command === 'slugbattle') {
      const moveIndex = args[1];
      handleSlugBattleCommand(playerData, setPlayerData, broadcast, moveIndex, username);
      return;
    } else if (command === 'slugtrain') {
      const slugIndex = args[1];
      handleSlugTrainCommand(playerData, setPlayerData, broadcast, slugIndex);
      return;
    } else if (command === 'slugfuse') {
      const slug1Index = args[1];
      const slug2Index = args[2];
      handleSlugFuseCommand(playerData, setPlayerData, broadcast, slug1Index, slug2Index);
      return;
    }
    
    // Handle admin commands
    if (command === 'givecoins') {
      const targetUser = args[1];
      const amount = parseInt(args[2]);
      handleGiveCoinsCommand(username, targetUser, amount, isAdmin, broadcast);
      return;
    } else if (command === 'givepokemon') {
      const targetUser = args[1];
      const pokemonName = args[2];
      const level = parseInt(args[3] || '5');
      handleGivePokemonCommand(username, targetUser, pokemonName, level, isAdmin, broadcast);
      return;
    } else if (command === 'announce') {
      const message = args.slice(1).join(' ');
      handleAnnouncementCommand(username, message, isAdmin, broadcast);
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
