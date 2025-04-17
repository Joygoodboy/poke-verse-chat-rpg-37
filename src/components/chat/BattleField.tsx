
import React, { useState, useEffect } from 'react';
import { BattleState, BattlePokemon } from '@/hooks/usePokemonBattle';
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Swords, ArrowRight, Shield, Zap, Info, Video, Flame } from "lucide-react";
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
  const [showVideo, setShowVideo] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  
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
  
  // Video effect for critical moves and when a Pokémon faints
  useEffect(() => {
    if (lastAttack && (lastAttack.isCritical || lastAttack.damage > 30)) {
      const moveType = lastAttack.moveName.toLowerCase();
      let videoId = '';
      
      if (moveType.includes('fire') || moveType.includes('ember') || moveType.includes('blast')) {
        videoId = 'rHG-JO8gIGk'; // Fire attack video
      } else if (moveType.includes('water') || moveType.includes('bubble')) {
        videoId = 'EBYsx1QWF9A'; // Water attack video
      } else if (moveType.includes('thunder') || moveType.includes('shock')) {
        videoId = 'v2kWMmL_3D8'; // Electric attack video
      } else {
        videoId = 'rHG-JO8gIGk'; // Default attack video
      }
      
      setVideoUrl(`https://www.youtube.com/embed/${videoId}?autoplay=1&controls=0&showinfo=0&rel=0&loop=1&playlist=${videoId}&mute=1`);
      setShowVideo(true);
      
      // Close video after 3 seconds
      const timer = setTimeout(() => {
        setShowVideo(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
    
    if (winner) {
      // Show victory video
      setVideoUrl('https://www.youtube.com/embed/5_aRjvM_DHo?autoplay=1&controls=0&showinfo=0&rel=0&start=5&mute=1');
      setShowVideo(true);
      
      // Close video after 5 seconds
      const timer = setTimeout(() => {
        setShowVideo(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [lastAttack, winner]);
  
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
      
      {/* Video overlay */}
      {showVideo && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center" onClick={() => setShowVideo(false)}>
          <div className="relative w-full max-w-2xl aspect-video">
            <iframe 
              className="absolute inset-0 w-full h-full"
              src={videoUrl} 
              title="Battle video effect"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
            <button 
              className="absolute top-2 right-2 bg-white/10 text-white p-1 rounded-full hover:bg-white/30"
              onClick={(e) => {
                e.stopPropagation();
                setShowVideo(false);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
      
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
              <div className="px-3 py-1 bg-yellow-500 text-black font-bold rounded animate-pulse">
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
                {isUserTurn && userPokemon.moves && userPokemon.moves.map((move, index) => (
                  <Button 
                    key={index}
                    onClick={() => onMoveSelect(index)}
                    className={`text-sm py-1 ${
                      move.type === "Fire" ? "bg-red-600 hover:bg-red-700" :
                      move.type === "Water" ? "bg-blue-600 hover:bg-blue-700" :
                      move.type === "Grass" ? "bg-green-600 hover:bg-green-700" :
                      move.type === "Electric" ? "bg-yellow-600 hover:bg-yellow-700" :
                      "bg-indigo-600 hover:bg-indigo-700"
                    } text-white flex items-center justify-between group relative overflow-hidden`}
                    disabled={!isUserTurn}
                  >
                    <span className="capitalize relative z-10">{move.name}</span>
                    <div className="flex items-center relative z-10">
                      <Zap className="h-3 w-3 mr-1" />
                      <span>{move.power}</span>
                    </div>
                    {/* Move hover effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity">
                      {move.type === "Fire" && <Flame className="absolute right-0 bottom-0 h-10 w-10 text-yellow-300" />}
                      {move.type === "Water" && <svg className="absolute right-0 bottom-0 h-10 w-10 text-blue-300" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8z"/></svg>}
                      {move.type === "Electric" && <svg className="absolute right-0 bottom-0 h-10 w-10 text-yellow-300" viewBox="0 0 24 24"><path fill="currentColor" d="M7 2v11h3v9l7-12h-4l4-8z"/></svg>}
                      {move.type === "Grass" && <svg className="absolute right-0 bottom-0 h-10 w-10 text-green-300" viewBox="0 0 24 24"><path fill="currentColor" d="M12 22c4.97 0 9-4.03 9-9-4.97 0-9 4.03-9 9zm0-18c-4.97 0-9 4.03-9 9 4.97 0 9-4.03 9-9zm0 0c0 4.97 4.03 9 9 9-4.97 0-9-4.03-9-9zm0 0c0-4.97-4.03-9-9-9 4.97 0 9 4.03 9 9z"/></svg>}
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
