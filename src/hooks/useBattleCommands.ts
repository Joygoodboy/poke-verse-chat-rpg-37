
import { PlayerData } from '@/types/gameTypes';
import { handleLeaderboardCommand, handleCatchCommand, handleSpawnCommand } from '../utils/commandHandlers';

type BattleCommandsProps = {
  username: string;
  playerData: PlayerData;
  setPlayerData: (data: PlayerData) => void;
  broadcast: (text: string, image?: string | null) => void;
  activeBattle: any;
  pendingChallenge: string | null;
  selectingPokemon: boolean;
  challengePlayer: (opponentName: string, broadcast: any) => void;
  acceptChallenge: (broadcast: any) => void;
  selectPokemon: (pokemon: any, broadcast: any) => void;
  executeMove: (moveIndex: number, broadcast: any) => void;
  forfeitBattle: (broadcast: any) => void;
  getPokemonStats: (broadcast: any) => void;
  onlineUsers: string[];
};

export const useBattleCommands = ({
  username,
  playerData,
  setPlayerData,
  broadcast,
  activeBattle,
  pendingChallenge,
  selectingPokemon,
  challengePlayer,
  acceptChallenge,
  selectPokemon,
  executeMove,
  forfeitBattle,
  getPokemonStats,
  onlineUsers
}: BattleCommandsProps) => {
  
  const handleBattleCommand = (message: string) => {
    if (!message.trim()) return;
    
    if (message.startsWith('/pokemonstats') || message.startsWith('/pstats')) {
      if (activeBattle) {
        getPokemonStats(broadcast);
      } else {
        broadcast("This command can only be used during a battle.");
      }
      return true;
    }
    
    if (message.startsWith('/select') || message.startsWith('/selectpokemon')) {
      const args = message.split(' ');
      if (args.length < 2) {
        broadcast("Usage: /select [number] - Select a Pokémon from your party by its index");
        return true;
      }
      
      const pokemonIndex = parseInt(args[1]);
      if (isNaN(pokemonIndex) || pokemonIndex < 0 || !playerData.party || pokemonIndex >= playerData.party.length) {
        broadcast("Invalid Pokémon index. Please use a valid number that corresponds to a Pokémon in your party.");
        return true;
      }
      
      const selectedPokemon = playerData.party[pokemonIndex];
      if (activeBattle && selectingPokemon) {
        selectPokemon(selectedPokemon, broadcast);
      } else {
        broadcast(`You selected ${selectedPokemon.name} (party index: ${pokemonIndex})`);
      }
      return true;
    }
    
    if (message.startsWith('/pokemonchallenge') || message.startsWith('/pch')) {
      const args = message.split(' ');
      if (args.length < 2) {
        broadcast("Usage: /pokemonchallenge <username> or /pch <username>");
        return true;
      }
      
      const opponentName = args[1];
      if (!onlineUsers.includes(opponentName)) {
        broadcast(`User ${opponentName} is not online.`);
        return true;
      }
      
      if (opponentName === username) {
        broadcast("You can't challenge yourself!");
        return true;
      }
      
      if (!playerData.party || playerData.party.length === 0) {
        broadcast("You need at least one Pokémon in your party to challenge someone! Use /spawn and then /catch to get a Pokémon first.");
        return true;
      }
      
      challengePlayer(opponentName, broadcast);
      return true;
    }
    
    if (message.startsWith('/challenge') || message.startsWith('/ch')) {
      const args = message.split(' ');
      if (args.length < 2 || args[1].toLowerCase() !== 'accept') {
        broadcast("Usage: /challenge accept or /ch accept");
        return true;
      }
      
      if (!playerData.party || playerData.party.length === 0) {
        broadcast("You need at least one Pokémon in your party to accept a challenge! Use /spawn and then /catch to get a Pokémon first.");
        return true;
      }
      
      acceptChallenge(broadcast);
      return true;
    }
    
    if (message.startsWith('/battle')) {
      const args = message.split(' ');
      const moveIndex = parseInt(args[1]) - 1 || 0; // Default to first move if not specified
      
      executeMove(moveIndex, broadcast);
      return true;
    }
    
    if (message.startsWith('/forfeit')) {
      forfeitBattle(broadcast);
      return true;
    }

    if (message.startsWith('/help')) {
      return false; // Let the main command handler handle this
    }
    
    if (message.startsWith('/lb') || message.startsWith('/leaderboard')) {
      handleLeaderboardCommand(broadcast);
      return true;
    }
    
    if (message.startsWith('/rob')) {
      return false; // Let the main command system handle this
    }

    if (message.startsWith('/catch')) {
      const args = message.split(' ');
      const ballType = args.length > 1 ? args[1] : undefined;
      if (playerData.lastSpawn) {
        handleCatchCommand(playerData, setPlayerData, broadcast, ballType);
      } else {
        broadcast("No Pokémon to catch! Use /spawn first.");
      }
      return true;
    }

    if (message.startsWith('/spawn')) {
      handleSpawnCommand(playerData, setPlayerData, broadcast);
      return true;
    }
    
    if (message.startsWith('/clearchat') || message.startsWith('/logout')) {
      return false; // Let the main command handler handle these
    }
    
    return false; // Not a battle command
  };

  return {
    handleBattleCommand
  };
};
