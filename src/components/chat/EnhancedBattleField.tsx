import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { usePlayerData } from '@/hooks/usePlayerData';
import { usePokemonBattle } from '@/hooks/usePokemonBattle';
import { useCommandHandler } from '@/hooks/useCommandHandler';

interface EnhancedBattleFieldProps {
  battle: any;
  username: string;
  onMoveSelect: (moveIndex: number) => void;
  onForfeit: () => void;
  onPokemonStats: () => void;
}

// Enhanced battle field with visual effects
const EnhancedBattleField: React.FC<EnhancedBattleFieldProps> = ({
  battle,
  username,
  onMoveSelect,
  onForfeit,
  onPokemonStats
}) => {
  const { playerData } = usePlayerData(username);
  const battleHook = usePokemonBattle(username);
  const [showMoveDetails, setShowMoveDetails] = useState(false);
  
  // Extract battle data from the hook's activeBattle property
  const playerPokemon = battleHook.activeBattle?.challenger === username ? 
    battleHook.activeBattle.challengerPokemon : battleHook.activeBattle?.opponentPokemon;
  const opponentPokemon = battleHook.activeBattle?.challenger === username ? 
    battleHook.activeBattle.opponentPokemon : battleHook.activeBattle?.challengerPokemon;
  const battleActive = battleHook.activeBattle?.isActive || false;
  
  const { handleCommand } = useCommandHandler({
    username,
    playerData: playerData || {},
    setPlayerData: () => {},
    broadcast: () => {},
    logout: () => {},
    isAdmin: false,
    isOwner: false
  });

  if (!battleActive || !playerPokemon || !opponentPokemon) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="p-8 text-center">
          <h3 className="text-xl font-bold mb-4">No Active Battle</h3>
          <p className="text-muted-foreground">
            Use /pokemonchallenge to start a battle!
          </p>
        </Card>
      </div>
    );
  }

  const handleAttack = (moveIndex: number) => {
    if (battleHook.executeMove) {
      battleHook.executeMove(moveIndex, () => {});
    }
    onMoveSelect(moveIndex);
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-blue-50 to-purple-100 dark:from-blue-950 dark:to-purple-950">
      {/* Header */}
      <div className="p-4 border-b bg-white/50 dark:bg-gray-900/50">
        <h2 className="text-2xl font-bold text-center text-blue-800 dark:text-blue-200">
          ⚔️ Pokémon Battle Arena ⚔️
        </h2>
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          {battleHook.activeBattle.challenger} vs {battleHook.activeBattle.opponent}
        </p>
      </div>

      {/* Battle Field */}
      <div className="flex-1 p-4">
        <div className="grid grid-cols-2 gap-4 h-full">
          {/* Player Pokémon */}
          <Card className="p-4 bg-white/80 dark:bg-gray-900/80">
            <div className="text-center">
              <h3 className="text-lg font-bold mb-2">{playerPokemon.name}</h3>
              <img 
                src={playerPokemon.image || '/placeholder.svg'} 
                alt={playerPokemon.name}
                className="w-24 h-24 mx-auto rounded-lg shadow-lg mb-2"
              />
              <Badge variant="secondary">Level {playerPokemon.level}</Badge>
              
              {/* Health Bar */}
              <div className="mt-3">
                <div className="flex justify-between text-sm mb-1">
                  <span>HP</span>
                  <span>{playerPokemon.health}/{playerPokemon.maxHealth}</span>
                </div>
                <Progress 
                  value={(playerPokemon.health / playerPokemon.maxHealth) * 100}
                  className="h-3"
                />
              </div>

              {/* Type Badge */}
              {playerPokemon.type && (
                <Badge 
                  className={`mt-2 bg-blue-500 text-white`}
                >
                  {playerPokemon.type}
                </Badge>
              )}
            </div>
          </Card>

          {/* Opponent Pokémon */}
          <Card className="p-4 bg-white/80 dark:bg-gray-900/80">
            <div className="text-center">
              <h3 className="text-lg font-bold mb-2">{opponentPokemon.name}</h3>
              <img 
                src={opponentPokemon.image || '/placeholder.svg'} 
                alt={opponentPokemon.name}
                className="w-24 h-24 mx-auto rounded-lg shadow-lg mb-2"
              />
              <Badge variant="secondary">Level {opponentPokemon.level}</Badge>
              
              {/* Health Bar */}
              <div className="mt-3">
                <div className="flex justify-between text-sm mb-1">
                  <span>HP</span>
                  <span>{opponentPokemon.health}/{opponentPokemon.maxHealth}</span>
                </div>
                <Progress 
                  value={(opponentPokemon.health / opponentPokemon.maxHealth) * 100}
                  className="h-3"
                />
              </div>

              {/* Type Badge */}
              {opponentPokemon.type && (
                <Badge 
                  className={`mt-2 bg-red-500 text-white`}
                >
                  {opponentPokemon.type}
                </Badge>
              )}
            </div>
          </Card>
        </div>

        {/* Battle Controls */}
        <Card className="mt-4 p-4 bg-white/90 dark:bg-gray-900/90">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button
              onClick={() => setShowMoveDetails(!showMoveDetails)}
              variant="default"
            >
              {showMoveDetails ? 'Hide Moves' : 'Show Moves'}
            </Button>
            
            <Button
              onClick={onPokemonStats}
              variant="secondary"
            >
              Pokémon Stats
            </Button>
            
            <Button
              onClick={() => handleCommand('/switch')}
              variant="outline"
            >
              Switch
            </Button>
            
            <Button
              onClick={onForfeit}
              variant="destructive"
            >
              Forfeit
            </Button>
          </div>

          {/* Move Selection */}
          {showMoveDetails && playerPokemon.moves && (
            <div className="mt-4 grid grid-cols-2 gap-2">
              {playerPokemon.moves.map((move, index) => (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => handleAttack(index)}
                  disabled={battleHook.activeBattle.turn !== username}
                  className="text-left p-3 h-auto"
                >
                  <div>
                    <div className="font-medium">
                      {typeof move === 'object' ? move.name : move}
                    </div>
                    {typeof move === 'object' && (
                      <div className="text-xs text-muted-foreground">
                        Power: {move.power} | Acc: {move.accuracy}%
                      </div>
                    )}
                  </div>
                </Button>
              ))}
            </div>
          )}

          {/* Turn Indicator */}
          <div className="mt-4 text-center">
            <p className="text-sm font-medium">
              {battleHook.activeBattle.turn === username ? 
                "Your turn!" : 
                `Waiting for ${battleHook.activeBattle.turn}...`
              }
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default EnhancedBattleField;