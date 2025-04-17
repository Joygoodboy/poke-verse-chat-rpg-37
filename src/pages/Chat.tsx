
import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useChat, OWNER_LIST, ADMIN_LIST } from "@/hooks/useChat";
import { usePokemonBattle } from "@/hooks/usePokemonBattle";
import { useOnlineUsers } from "@/hooks/useOnlineUsers";
import { isAdminUser, isOwnerUser } from "@/utils/gameCommands";
import { useToast } from "@/hooks/use-toast";
import { ChatContainer } from "@/components/chat/ChatContainer";

const Chat = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem("loggedInUser") || "";
  const { toast } = useToast();
  
  if (!username) {
    navigate("/login");
    return null;
  }

  const { 
    messages, 
    playerData, 
    broadcast, 
    commandSystemRef, 
    handleCommand,
    logout 
  } = useChat(username);
  
  const onlineUsers = useOnlineUsers(username);
  
  const {
    activeBattle,
    pendingChallenge,
    selectingPokemon,
    initBattleListener,
    challengePlayer,
    acceptChallenge,
    selectPokemon,
    executeMove,
    getPokemonStats,
    forfeitBattle
  } = usePokemonBattle(username);
  
  const userIsAdmin = isAdminUser(username, OWNER_LIST, ADMIN_LIST);
  const userIsOwner = isOwnerUser(username, OWNER_LIST);

  const handleSendCommand = async (message: string) => {
    if (!message.trim()) return;
    
    if (message.startsWith('/pokemonstats') || message.startsWith('/pstats')) {
      if (activeBattle) {
        getPokemonStats(broadcast);
      } else {
        broadcast("This command can only be used during a battle.");
      }
      return;
    }
    
    if (message.startsWith('/select') || message.startsWith('/selectpokemon')) {
      const args = message.split(' ');
      if (args.length < 2) {
        broadcast("Usage: /select [number] - Select a Pokémon from your party by its index");
        return;
      }
      
      const pokemonIndex = parseInt(args[1]);
      if (isNaN(pokemonIndex) || pokemonIndex < 0 || !playerData.party || pokemonIndex >= playerData.party.length) {
        broadcast("Invalid Pokémon index. Please use a valid number that corresponds to a Pokémon in your party.");
        return;
      }
      
      const selectedPokemon = playerData.party[pokemonIndex];
      if (activeBattle && selectingPokemon) {
        selectPokemon(selectedPokemon, broadcast);
      } else {
        broadcast(`You selected ${selectedPokemon.name} (party index: ${pokemonIndex})`);
      }
      return;
    }
    
    if (message.startsWith('/pokemonchallenge') || message.startsWith('/pch')) {
      const args = message.split(' ');
      if (args.length < 2) {
        broadcast("Usage: /pokemonchallenge <username> or /pch <username>");
        return;
      }
      
      const opponentName = args[1];
      if (!onlineUsers.includes(opponentName)) {
        broadcast(`User ${opponentName} is not online.`);
        return;
      }
      
      if (opponentName === username) {
        broadcast("You can't challenge yourself!");
        return;
      }
      
      if (!playerData.party || playerData.party.length === 0) {
        broadcast("You need at least one Pokémon in your party to challenge someone! Use /spawn and then /catch to get a Pokémon first.");
        return;
      }
      
      challengePlayer(opponentName, broadcast);
      return;
    }
    
    if (message.startsWith('/challenge') || message.startsWith('/ch')) {
      const args = message.split(' ');
      if (args.length < 2 || args[1].toLowerCase() !== 'accept') {
        broadcast("Usage: /challenge accept or /ch accept");
        return;
      }
      
      if (!playerData.party || playerData.party.length === 0) {
        broadcast("You need at least one Pokémon in your party to accept a challenge! Use /spawn and then /catch to get a Pokémon first.");
        return;
      }
      
      acceptChallenge(broadcast);
      return;
    }
    
    if (message.startsWith('/battle')) {
      const args = message.split(' ');
      const moveIndex = parseInt(args[1]) - 1 || 0; // Default to first move if not specified
      
      executeMove(moveIndex, broadcast);
      return;
    }
    
    if (message.startsWith('/forfeit')) {
      forfeitBattle(broadcast);
      return;
    }

    if (message.startsWith('/help')) {
      handleCommand('/help');
      return;
    }
    
    if (message.startsWith('/lb') || message.startsWith('/leaderboard')) {
      handleCommand('/lb');
      return;
    }
    
    if (message.startsWith('/rob')) {
      const args = message.split(' ');
      if (args.length < 2) {
        broadcast("Usage: /rob <username>");
        return;
      }
      handleCommand(message);
      return;
    }

    if (message.startsWith('/catch')) {
      handleCommand(message);
      return;
    }

    if (message.startsWith('/spawn')) {
      handleCommand(message);
      return;
    }
    
    if (message.startsWith('/clearchat')) {
      handleCommand(message);
      return;
    }
    
    if (message.startsWith('/logout')) {
      handleCommand(message);
      return;
    }
    
    broadcast(message);
    
    if (message.startsWith('/')) {
      const args = message.split(" ");
      const base = args[0].toLowerCase();
      const commandName = base.replace('/', '');
      
      if (commandSystemRef && typeof commandSystemRef === 'object' && typeof commandSystemRef[commandName] === 'function') {
        try {
          const userData = { 
            isOwner: userIsOwner,
            isAdmin: userIsAdmin
          };
          
          const response = commandSystemRef[commandName](args.slice(1), userData);
          broadcast(response);
        } catch (error) {
          console.error(`Error executing command '${commandName}':`, error);
          broadcast(`Error executing command '${commandName}'. Please try again later.`);
        }
      } else {
        console.log(`Command '${commandName}' not found or not a function`);
        broadcast(`Command '${commandName}' not available. Try /help for available commands.`);
      }
    }
  };

  const handleBanUser = (user: string) => {
    handleSendCommand(`/ban ${user}`);
  };
  
  const handleSelectPokemon = (pokemon: any) => {
    selectPokemon(pokemon, broadcast);
  };

  const handleCommandButtonClick = (command: string) => {
    handleSendCommand(`/${command}`);
    toast({
      title: `Command executed: /${command}`,
      description: "Check the chat for results",
      duration: 3000,
    });
  };

  return (
    <ChatContainer 
      username={username}
      messages={messages}
      playerData={playerData}
      onlineUsers={onlineUsers}
      activeBattle={activeBattle}
      pendingChallenge={pendingChallenge}
      selectingPokemon={selectingPokemon}
      userIsAdmin={userIsAdmin}
      userIsOwner={userIsOwner}
      handleSendCommand={handleSendCommand}
      handleBanUser={handleBanUser}
      handleSelectPokemon={handleSelectPokemon}
      handleCommandButtonClick={handleCommandButtonClick}
      executeMove={executeMove}
      forfeitBattle={forfeitBattle}
      getPokemonStats={getPokemonStats}
      broadcast={broadcast}
    />
  );
};

export default Chat;
