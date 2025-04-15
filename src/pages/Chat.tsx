
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatMessages } from "@/components/chat/ChatMessages";
import { ChatInput } from "@/components/chat/ChatInput";
import { OnlineUsers } from "@/components/chat/OnlineUsers";
import { PlayerInfo } from "@/components/chat/PlayerInfo";
import { BattleField } from "@/components/chat/BattleField";
import { PokemonSelector } from "@/components/chat/PokemonSelector";
import { useChat, availableCommands, OWNER_LIST, ADMIN_LIST } from "@/hooks/useChat";
import { usePokemonBattle } from "@/hooks/usePokemonBattle";
import { useOnlineUsers } from "@/hooks/useOnlineUsers";
import { isAdminUser, isOwnerUser } from "@/utils/gameCommands";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  HelpCircle,
  Gamepad2,
  Wallet,
  DollarSign,
  Award,
  UserMinus,
  Shield,
  ZapIcon
} from "lucide-react";
import { CommandButtons } from "@/components/chat/CommandButtons";

const Chat = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem("loggedInUser") || "";
  const { toast } = useToast();
  const commandsContainerRef = useRef<HTMLDivElement>(null);
  
  if (!username) {
    navigate("/login");
    return null;
  }

  const { 
    messages, 
    playerData, 
    broadcast, 
    commandSystemRef, 
    handleCommand 
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
    forfeitBattle
  } = usePokemonBattle(username);
  
  useEffect(() => {
    initBattleListener();
  }, []);
  
  const userIsAdmin = isAdminUser(username, OWNER_LIST, ADMIN_LIST);
  const userIsOwner = isOwnerUser(username, OWNER_LIST);

  const handleSendCommand = async (message: string) => {
    if (!message.trim()) return;
    
    // Handle battle-related commands
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
      
      challengePlayer(opponentName, broadcast);
      return;
    }
    
    if (message.startsWith('/challenge') || message.startsWith('/ch')) {
      const args = message.split(' ');
      if (args.length < 2 || args[1].toLowerCase() !== 'accept') {
        broadcast("Usage: /challenge accept or /ch accept");
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
    
    // Special commands that should be handled directly
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
    
    // Broadcast the message to chat
    broadcast(message);
    
    // Process standard commands
    const args = message.split(" ");
    const base = args[0].toLowerCase();
    const commandName = base.replace('/', '');
    
    if (commandSystemRef && commandSystemRef[commandName]) {
      const userData = { 
        isOwner: userIsOwner,
        isAdmin: userIsAdmin
      };
      
      const response = commandSystemRef[commandName](args.slice(1), userData);
      broadcast(response);
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

  // Group commands by category for the command buttons
  const economyCommands = [
    { name: "wallet", icon: <Wallet size={18} /> },
    { name: "slot", icon: <DollarSign size={18} /> },
    { name: "daily", icon: <Award size={18} /> },
    { name: "shop", icon: <DollarSign size={18} /> },
    { name: "lb", icon: <Award size={18} /> }
  ];

  const pokemonCommands = [
    { name: "spawn", icon: <Gamepad2 size={18} /> },
    { name: "party", icon: <Gamepad2 size={18} /> },
    { name: "pc", icon: <Gamepad2 size={18} /> },
    { name: "rb", icon: <ZapIcon size={18} /> }
  ];

  const adminCommands = userIsAdmin ? [
    { name: "ban", icon: <UserMinus size={18} /> },
    { name: "unban", icon: <UserMinus size={18} /> },
    { name: "owner", icon: <Shield size={18} /> },
    { name: "mods", icon: <Shield size={18} /> }
  ] : [];

  return (
    <div className="flex h-screen bg-blue-500">
      <OnlineUsers
        users={onlineUsers}
        username={username}
        isOwner={userIsOwner}
        onBanUser={handleBanUser}
      />
      
      <div className="flex-1 flex flex-col bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden">
        <ChatHeader 
          username={username}
          isAdmin={userIsAdmin}
          isOwner={userIsOwner}
        />
        
        {/* Command Buttons */}
        <div 
          ref={commandsContainerRef}
          className="p-2 bg-blue-600/40 backdrop-blur-sm flex flex-wrap gap-2 overflow-x-auto"
        >
          <Button 
            variant="secondary" 
            className="flex items-center gap-1 bg-indigo-700 hover:bg-indigo-800 text-white"
            onClick={() => handleCommandButtonClick('help')}
          >
            <HelpCircle size={18} />
            Help
          </Button>
          
          <CommandButtons 
            title="Economy" 
            commands={economyCommands} 
            onCommandClick={handleCommandButtonClick}
            className="bg-green-700 hover:bg-green-800"
          />
          
          <CommandButtons 
            title="Pokémon" 
            commands={pokemonCommands} 
            onCommandClick={handleCommandButtonClick}
            className="bg-red-700 hover:bg-red-800"
          />
          
          {userIsAdmin && (
            <CommandButtons 
              title="Admin" 
              commands={adminCommands} 
              onCommandClick={handleCommandButtonClick}
              className="bg-purple-800 hover:bg-purple-900"
            />
          )}
        </div>
        
        {/* Battle UI */}
        {activeBattle && (
          <div className="p-2">
            {selectingPokemon ? (
              <PokemonSelector 
                party={playerData.party}
                onSelect={handleSelectPokemon}
              />
            ) : (
              <BattleField 
                battle={activeBattle}
                username={username}
                onMoveSelect={(moveIndex) => executeMove(moveIndex, broadcast)}
                onForfeit={() => forfeitBattle(broadcast)}
              />
            )}
          </div>
        )}
        
        {pendingChallenge && !activeBattle && (
          <div className="p-4 bg-yellow-500/80 text-center text-white">
            <p>⚔️ You have challenged {pendingChallenge} to a battle! Waiting for them to accept...</p>
          </div>
        )}
        
        <ChatMessages 
          messages={messages}
          username={username}
        />
        
        <ChatInput 
          onSendMessage={handleSendCommand}
        />
      </div>
      
      <PlayerInfo 
        username={username} 
        playerData={playerData}
      />
    </div>
  );
};

export default Chat;
