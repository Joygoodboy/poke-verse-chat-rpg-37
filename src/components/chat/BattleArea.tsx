
import React from 'react';
import { BattleField } from "@/components/chat/BattleField";
import { PokemonSelector } from "@/components/chat/PokemonSelector";

interface BattleAreaProps {
  activeBattle: any;
  pendingChallenge: string | null;
  selectingPokemon: boolean;
  username: string;
  playerData: any;
  onSelectPokemon: (pokemon: any) => void;
  onMoveSelect: (moveIndex: number) => void;
  onForfeit: () => void;
  onPokemonStats: () => void;
}

export const BattleArea: React.FC<BattleAreaProps> = ({
  activeBattle,
  pendingChallenge,
  selectingPokemon,
  username,
  playerData,
  onSelectPokemon,
  onMoveSelect,
  onForfeit,
  onPokemonStats
}) => {
  if (!activeBattle && !pendingChallenge) {
    return null;
  }
  
  return (
    <div className="p-2">
      {activeBattle && (
        <>
          {selectingPokemon ? (
            <PokemonSelector 
              party={playerData.party}
              onSelect={onSelectPokemon}
            />
          ) : (
            <BattleField 
              battle={activeBattle}
              username={username}
              onMoveSelect={onMoveSelect}
              onForfeit={onForfeit}
              onPokemonStats={onPokemonStats}
            />
          )}
        </>
      )}
      
      {pendingChallenge && !activeBattle && (
        <div className="p-4 bg-yellow-500/80 text-center text-white">
          <p>⚔️ You have challenged {pendingChallenge} to a battle! Waiting for them to accept...</p>
        </div>
      )}
    </div>
  );
};
