
import React from "react";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatMessages } from "@/components/chat/ChatMessages";
import { ChatInput } from "@/components/chat/ChatInput";
import { OnlineUsers } from "@/components/chat/OnlineUsers";
import { PlayerInfo } from "@/components/chat/PlayerInfo";
import { BattleArea } from "@/components/chat/BattleArea";
import { CommandPanel } from "@/components/chat/CommandPanel";

interface ChatContainerProps {
  username: string;
  messages: any[];
  playerData: any;
  onlineUsers: string[];
  activeBattle: any;
  pendingChallenge: string | null;
  selectingPokemon: boolean;
  userIsAdmin: boolean;
  userIsOwner: boolean;
  isLoading?: boolean;
  handleSendCommand: (message: string) => void;
  handleBanUser: (user: string) => void;
  handleSelectPokemon: (pokemon: any) => void;
  handleCommandButtonClick: (command: string) => void;
  executeMove: (moveIndex: number, broadcast: any) => void;
  forfeitBattle: (broadcast: any) => void;
  getPokemonStats: (broadcast: any) => void;
  broadcast: (text: string, image?: string | null) => void;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({
  username,
  messages,
  playerData,
  onlineUsers,
  activeBattle,
  pendingChallenge,
  selectingPokemon,
  userIsAdmin,
  userIsOwner,
  isLoading = false,
  handleSendCommand,
  handleBanUser,
  handleSelectPokemon,
  handleCommandButtonClick,
  executeMove,
  forfeitBattle,
  getPokemonStats,
  broadcast
}) => {
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
        
        <CommandPanel 
          userIsAdmin={userIsAdmin}
          onCommandClick={handleCommandButtonClick}
          isLoading={isLoading}
        />
        
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-white text-lg font-medium bg-blue-800/50 backdrop-blur-sm p-4 rounded-lg shadow-lg">
              Loading your Pokémon data...
            </div>
          </div>
        ) : (
          <>
            <BattleArea
              activeBattle={activeBattle}
              pendingChallenge={pendingChallenge}
              selectingPokemon={selectingPokemon}
              username={username}
              playerData={playerData}
              onSelectPokemon={handleSelectPokemon}
              onMoveSelect={(moveIndex) => executeMove(moveIndex, broadcast)}
              onForfeit={() => forfeitBattle(broadcast)}
              onPokemonStats={() => getPokemonStats(broadcast)}
            />
            
            <ChatMessages 
              messages={messages}
              username={username}
            />
          </>
        )}
        
        <ChatInput 
          onSendMessage={handleSendCommand}
          placeholder="Chat or enter a command (/help)..."
          disabled={isLoading}
        />
      </div>
      
      <PlayerInfo 
        username={username} 
        playerData={playerData}
      />
    </div>
  );
};
