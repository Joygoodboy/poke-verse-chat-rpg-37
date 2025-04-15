
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatMessages } from "@/components/chat/ChatMessages";
import { ChatInput } from "@/components/chat/ChatInput";
import { OnlineUsers } from "@/components/chat/OnlineUsers";
import { PlayerInfo } from "@/components/chat/PlayerInfo";
import { BattleField } from "@/components/chat/BattleField";
import { PokemonSelector } from "@/components/chat/PokemonSelector";
import { useChat } from "@/hooks/useChat";
import { usePokemonBattle } from "@/hooks/usePokemonBattle";
import { useOnlineUsers } from "@/hooks/useOnlineUsers";
import { isAdminUser, isOwnerUser } from "@/utils/gameCommands";
import { Card } from "@/components/ui/card";

const OWNER_LIST = ["Ash", "admin@pokemon.com", "owner@pokemon.com"];
const ADMIN_LIST = ["Gary", "mod@pokemon.com", "moderator@pokemon.com"];

const Chat = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem("loggedInUser") || "";
  
  if (!username) {
    navigate("/login");
    return null;
  }

  const { messages, playerData, broadcast, commandSystemRef } = useChat(username);
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

  const handleCommand = async (message: string) => {
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
    handleCommand(`/ban ${user}`);
  };
  
  const handleSelectPokemon = (pokemon: any) => {
    selectPokemon(pokemon, broadcast);
  };

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
          onSendMessage={handleCommand}
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
