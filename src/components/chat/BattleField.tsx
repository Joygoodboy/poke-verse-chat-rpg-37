
import React, { useState, useEffect } from 'react';
import { BattleState, BattlePokemon } from '@/hooks/usePokemonBattle';
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Swords, ArrowRight, Shield, Zap, Info } from "lucide-react";
import { generateBattleImage, generatePokedexEntry } from '@/utils/battleImageGenerator';

interface BattleFieldProps {
  battle: BattleState;
  username: string;
  onMoveSelect: (moveIndex: number) => void;
  onForfeit: () => void;
  onPokemonStats: () => void;
}

export const BattleField: React.FC<BattleFieldProps> = ({
  battle,
  username,
  onMoveSelect,
  onForfeit,
  onPokemonStats
}) => {
  const { challenger, opponent, challengerPokemon, opponentPokemon, turn, logs, winner, lastAttack } = battle;
  const [showPokedex, setShowPokedex] = useState(false);
  const [battleReady, setBattleReady] = useState(false);
  
  const isChallenger = username === challenger;
  const userPokemon = isChallenger ? challengerPokemon : opponentPokemon;
  const enemyPokemon = isChallenger ? opponentPokemon : challengerPokemon;
  
  const isUserTurn = turn === username;
  
  // Check if battle is ready (both Pokémon selected)
  useEffect(() => {
    if (userPokemon && enemyPokemon) {
      setBattleReady(true);
    } else {
      setBattleReady(false);
    }
  }, [userPokemon, enemyPokemon]);
  
  // If Pokémon aren't selected yet, show waiting message
  if (!userPokemon || !enemyPokemon) {
    return (
      <div className="p-4 text-center bg-gradient-to-b from-indigo-900 to-blue-900 rounded-lg text-white shadow-lg animate-pulse">
        <p className="text-xl font-bold mb-2">⚔️ Battle Starting ⚔️</p>
        <p>Waiting for both trainers to select their Pokémon...</p>
        <div className="mt-4 flex justify-center">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
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
  
  // Generate battle scene HTML
  const battleSceneHtml = generateBattleImage(battle, lastAttack);
  
  return (
    <div className="bg-gradient-to-b from-indigo-900 to-blue-900 rounded-lg p-4 mb-4 text-white shadow-lg relative overflow-hidden animate-fade-in">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[url('https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png')] opacity-5 bg-repeat"></div>
      
      <div className="relative z-10">
        {/* Battle header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold flex items-center">
            <Swords className="mr-2" /> Pokémon Battle
          </h3>
          
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-white border-white hover:bg-white/20"
              onClick={onPokemonStats}
            >
              <Info className="mr-1 h-4 w-4" /> Stats
            </Button>
            
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
        </div>
        
        {/* Battle field visualization */}
        <div className="mb-6" dangerouslySetInnerHTML={{ __html: battleSceneHtml }}></div>
        
        {/* Toggle between battle controls and Pokédex */}
        <div className="flex justify-center mb-4">
          <Button 
            variant={showPokedex ? "outline" : "default"}
            className="mr-2"
            onClick={() => setShowPokedex(false)}
          >
            <Swords className="mr-1 h-4 w-4" /> Battle
          </Button>
          <Button 
            variant={!showPokedex ? "outline" : "default"}
            onClick={() => setShowPokedex(true)}
          >
            <Shield className="mr-1 h-4 w-4" /> Pokédex
          </Button>
        </div>
        
        {showPokedex ? (
          /* Pokédex view */
          <div className="mb-4" dangerouslySetInnerHTML={{ __html: generatePokedexEntry(userPokemon) }}></div>
        ) : (
          /* Battle controls */
          !winner && (
            <div className="mb-4">
              <h4 className="text-sm font-bold mb-2">{isUserTurn ? "Choose a move:" : "Waiting for opponent..."}</h4>
              
              <div className="grid grid-cols-2 gap-2">
                {isUserTurn && userPokemon.moves.map((move, index) => (
                  <Button 
                    key={index}
                    onClick={() => onMoveSelect(index)}
                    className={`text-sm py-1 ${
                      move.type === "Fire" ? "bg-red-600 hover:bg-red-700" :
                      move.type === "Water" ? "bg-blue-600 hover:bg-blue-700" :
                      move.type === "Grass" ? "bg-green-600 hover:bg-green-700" :
                      move.type === "Electric" ? "bg-yellow-600 hover:bg-yellow-700" :
                      "bg-indigo-600 hover:bg-indigo-700"
                    } text-white flex items-center justify-between`}
                    disabled={!isUserTurn}
                  >
                    <span className="capitalize">{move.name}</span>
                    <div className="flex items-center">
                      <Zap className="h-3 w-3 mr-1" />
                      <span>{move.power}</span>
                    </div>
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
          )
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
