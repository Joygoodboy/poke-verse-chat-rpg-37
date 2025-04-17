
import React from "react";
import { useNavigate } from "react-router-dom";
import { useChat, OWNER_LIST, ADMIN_LIST } from "@/hooks/useChat";
import { usePokemonBattle } from "@/hooks/usePokemonBattle";
import { useOnlineUsers } from "@/hooks/useOnlineUsers";
import { useCommandHandler } from "@/hooks/useCommandHandler";
import { useBattleCommands } from "@/hooks/useBattleCommands";
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
    setPlayerData, 
    broadcast, 
    logout,
    isLoading 
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
  
  const { 
    handleCommand,
    commandSystemRef
  } = useCommandHandler({
    username,
    playerData,
    setPlayerData,
    broadcast,
    logout,
    isAdmin: userIsAdmin,
    isOwner: userIsOwner
  });
  
  const { 
    handleBattleCommand 
  } = useBattleCommands({
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
  });

  const handleSendCommand = async (message: string) => {
    if (!message.trim()) return;
    
    // First try battle commands
    const handledByBattle = handleBattleCommand(message);
    if (handledByBattle) return;
    
    // Then try system commands
    if (message.startsWith('/help') || message.startsWith('/clearchat') || message.startsWith('/logout')) {
      handleCommand(message);
      return;
    }
    
    // For non-command messages or other commands, broadcast to chat
    if (!message.startsWith('/')) {
      broadcast(message);
      return;
    }
    
    // Try to handle with command system
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
      isLoading={isLoading}
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
