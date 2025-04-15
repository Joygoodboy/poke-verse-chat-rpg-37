
import React from 'react';
import { BattleState, BattlePokemon } from '@/hooks/usePokemonBattle';
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Swords, ArrowRight } from "lucide-react";

interface BattleFieldProps {
  battle: BattleState;
  username: string;
  onMoveSelect: (moveIndex: number) => void;
  onForfeit: () => void;
}

export const BattleField: React.FC<BattleFieldProps> = ({
  battle,
  username,
  onMoveSelect,
  onForfeit
}) => {
  const { challenger, opponent, challengerPokemon, opponentPokemon, turn, logs, winner } = battle;
  
  const isChallenger = username === challenger;
  const userPokemon = isChallenger ? challengerPokemon : opponentPokemon;
  const enemyPokemon = isChallenger ? opponentPokemon : challengerPokemon;
  
  const isUserTurn = turn === username;
  
  if (!userPokemon || !enemyPokemon) {
    return (
      <div className="p-4 text-center">
        <p>Waiting for both trainers to select their Pokémon...</p>
      </div>
    );
  }
  
  const userHealthPercent = (userPokemon.health / userPokemon.maxHealth) * 100;
  const enemyHealthPercent = (enemyPokemon.health / enemyPokemon.maxHealth) * 100;
  
  const getHealthColor = (percent: number) => {
    if (percent > 50) return "bg-green-500";
    if (percent > 20) return "bg-yellow-500";
    return "bg-red-500";
  };
  
  return (
    <div className="bg-gradient-to-b from-indigo-900 to-blue-900 rounded-lg p-4 mb-4 text-white shadow-lg relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[url('https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png')] opacity-5 bg-repeat"></div>
      
      <div className="relative z-10">
        {/* Battle header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold flex items-center">
            <Swords className="mr-2" /> Pokémon Battle
          </h3>
          {winner ? (
            <div className="px-3 py-1 bg-yellow-500 text-black font-bold rounded">
              {winner === username ? "You Won!" : "You Lost!"}
            </div>
          ) : (
            <div className="px-3 py-1 bg-purple-700 text-white font-bold rounded">
              {isUserTurn ? "Your Turn" : "Opponent's Turn"}
            </div>
          )}
        </div>
        
        {/* Battle field */}
        <div className="flex justify-between items-center mb-6">
          {/* Enemy Pokemon */}
          <div className="w-1/3 text-center">
            <div className="mb-2">
              <span className="capitalize font-bold">{enemyPokemon.name}</span>
              <span className="text-xs ml-2">Lv.{enemyPokemon.level}</span>
            </div>
            
            <div className="relative mb-2">
              <div className="h-2 bg-gray-700 rounded-full">
                <div 
                  className={`h-2 ${getHealthColor(enemyHealthPercent)} rounded-full`} 
                  style={{width: `${enemyHealthPercent}%`}}
                ></div>
              </div>
              <div className="text-xs mt-1">
                {enemyPokemon.health} / {enemyPokemon.maxHealth} HP
              </div>
            </div>
            
            {enemyPokemon.image ? (
              <div className="flex justify-center">
                <img 
                  src={enemyPokemon.image} 
                  alt={enemyPokemon.name} 
                  className={`w-24 h-24 object-contain ${!isUserTurn ? 'animate-pulse' : ''}`} 
                />
              </div>
            ) : (
              <div className="w-24 h-24 bg-gray-800 rounded-full mx-auto"></div>
            )}
          </div>
          
          {/* Battle indicator */}
          <div className="w-1/3 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                <ArrowRight className={`text-white ${isUserTurn ? 'rotate-180' : ''} transition-transform duration-300`} size={24} />
              </div>
            </div>
          </div>
          
          {/* User Pokemon */}
          <div className="w-1/3 text-center">
            <div className="mb-2">
              <span className="capitalize font-bold">{userPokemon.name}</span>
              <span className="text-xs ml-2">Lv.{userPokemon.level}</span>
            </div>
            
            <div className="relative mb-2">
              <div className="h-2 bg-gray-700 rounded-full">
                <div 
                  className={`h-2 ${getHealthColor(userHealthPercent)} rounded-full`} 
                  style={{width: `${userHealthPercent}%`}}
                ></div>
              </div>
              <div className="text-xs mt-1">
                {userPokemon.health} / {userPokemon.maxHealth} HP
              </div>
            </div>
            
            {userPokemon.image ? (
              <div className="flex justify-center">
                <img 
                  src={userPokemon.image} 
                  alt={userPokemon.name} 
                  className={`w-24 h-24 object-contain ${isUserTurn ? 'animate-pulse' : ''}`} 
                />
              </div>
            ) : (
              <div className="w-24 h-24 bg-gray-800 rounded-full mx-auto"></div>
            )}
          </div>
        </div>
        
        {/* Battle controls */}
        {!winner && (
          <div className="mb-4">
            <h4 className="text-sm font-bold mb-2">{isUserTurn ? "Choose a move:" : "Waiting for opponent..."}</h4>
            
            <div className="grid grid-cols-2 gap-2">
              {isUserTurn && userPokemon.moves.map((move, index) => (
                <Button 
                  key={index}
                  onClick={() => onMoveSelect(index)}
                  className="text-sm py-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                  disabled={!isUserTurn}
                >
                  {move.name} ({move.power} Power)
                </Button>
              ))}
            </div>
            
            <div className="mt-2 text-center">
              <Button 
                onClick={onForfeit}
                variant="destructive"
                className="text-xs"
              >
                Forfeit Battle
              </Button>
            </div>
          </div>
        )}
        
        {/* Battle logs */}
        <div className="h-24 overflow-y-auto bg-black/30 rounded p-2 text-xs">
          {logs.slice(-10).map((log, index) => (
            <div key={index} className="mb-1">{log}</div>
          ))}
        </div>
      </div>
    </div>
  );
};
