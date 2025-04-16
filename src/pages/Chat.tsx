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
import { useToast } from "@/hooks/use-toast";
import {
  HelpCircle,
  Gamepad2,
  Wallet,
  DollarSign,
  Award,
  UserMinus,
  Shield,
  ZapIcon,
  Users,
  Gift,
  PackageIcon,
  ShoppingCart,
  Calculator,
  Zap,
  PlusCircle
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
  
  // We don't need this useEffect anymore since the battle listener 
  // is initialized within the usePokemonBattle hook's own useEffect
  useEffect(() => {
    console.log("Battle functionality initialized");
  }, []);
  
  const userIsAdmin = isAdminUser(username, OWNER_LIST, ADMIN_LIST);
  const userIsOwner = isOwnerUser(username, OWNER_LIST);

  const handleSendCommand = async (message: string) => {
    if (!message.trim()) return;
    
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

  const economyCommands = [
    { name: "wallet", icon: <Wallet size={18} /> },
    { name: "slot", icon: <DollarSign size={18} /> },
    { name: "daily", icon: <Gift size={18} /> },
    { name: "shop", icon: <ShoppingCart size={18} /> },
    { name: "lb", icon: <Award size={18} /> }
  ];

  const pokemonCommands = [
    { name: "spawn", icon: <Gamepad2 size={18} /> },
    { name: "catch", icon: <PlusCircle size={18} /> },
    { name: "party", icon: <Users size={18} /> },
    { name: "pc", icon: <Gamepad2 size={18} /> },
    { name: "rb", icon: <Zap size={18} /> }
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
        
        <div 
          ref={commandsContainerRef}
          className="p-2 bg-blue-600/40 backdrop-blur-sm flex flex-wrap gap-2 overflow-x-auto"
        >
          <CommandButtons 
            title="Help" 
            commands={[]} 
            onCommandClick={handleCommandButtonClick}
            className="bg-indigo-700 hover:bg-indigo-800 text-white"
            icon={<HelpCircle size={18} />}
          />
          
          <CommandButtons 
            title="Spawn" 
            commands={[]}
            onCommandClick={handleCommandButtonClick}
            className="bg-green-700 hover:bg-green-800 text-white"
            icon={<Gamepad2 size={18} />}
          />
          
          <CommandButtons 
            title="Catch" 
            commands={[]}
            onCommandClick={() => handleCommandButtonClick("catch")}
            className="bg-red-600 hover:bg-red-700 text-white"
            icon={<PlusCircle size={18} />}
          />
          
          <CommandButtons 
            title="Rank" 
            commands={[]}
            onCommandClick={() => handleCommandButtonClick("lb")}
            className="bg-purple-700 hover:bg-purple-800 text-white"
            icon={<Award size={18} />}
          />
          
          <CommandButtons 
            title="Inventory" 
            commands={[]}
            onCommandClick={handleCommandButtonClick}
            className="bg-red-700 hover:bg-red-800 text-white"
            icon={<PackageIcon size={18} />}
          />
          
          <CommandButtons 
            title="Shop" 
            commands={[]}
            onCommandClick={handleCommandButtonClick}
            className="bg-blue-700 hover:bg-blue-800 text-white"
            icon={<ShoppingCart size={18} />}
          />
          
          <CommandButtons 
            title="Daily" 
            commands={[]}
            onCommandClick={handleCommandButtonClick}
            className="bg-amber-600 hover:bg-amber-700 text-white"
            icon={<Gift size={18} />}
          />
          
          <CommandButtons 
            title="Economy" 
            commands={economyCommands} 
            onCommandClick={handleCommandButtonClick}
            className="bg-green-700 hover:bg-green-800 text-white"
            icon={<Calculator size={18} />}
          />
          
          <CommandButtons 
            title="Pokémon" 
            commands={pokemonCommands} 
            onCommandClick={handleCommandButtonClick}
            className="bg-red-700 hover:bg-red-800 text-white"
            icon={<Gamepad2 size={18} />}
          />
          
          {userIsAdmin && (
            <CommandButtons 
              title="Admin" 
              commands={adminCommands} 
              onCommandClick={handleCommandButtonClick}
              className="bg-purple-800 hover:bg-purple-900 text-white"
              icon={<Shield size={18} />}
            />
          )}
        </div>
        
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
          placeholder="Chat or enter a command (/help)..."
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
