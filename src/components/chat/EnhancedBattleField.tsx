
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { usePlayerData } from '../../hooks/usePlayerData';
import { usePokemonBattle } from '../../hooks/usePokemonBattle';
import { useCommandHandler } from '../../hooks/useCommandHandler';
import { BattleFusionSystem, BattlePokemon } from '../../utils/battleFusion';
import { playBattleAnimation, AnimationType } from '../../utils/battleAnimations';
import { battleCommentary, CommentaryType } from '../../utils/battleCommentary';
import '../../utils/battleAnimations.css';

// Enhanced battle field with visual effects and fusion
const EnhancedBattleField: React.FC = () => {
  const { playerData } = usePlayerData();
  const { 
    playerPokemon, 
    opponentPokemon, 
    battleActive, 
    playerHealth, 
    opponentHealth,
    playerMaxHealth,
    opponentMaxHealth,
    attackOpponent,
    endBattle
  } = usePokemonBattle();
  
  const { executeCommand } = useCommandHandler();
  
  // State for fusion UI
  const [showFusionUI, setShowFusionUI] = useState(false);
  const [selectedForFusion, setSelectedForFusion] = useState<number[]>([]);
  const [showMoveDetails, setShowMoveDetails] = useState(false);
  
  // Battle fusion system
  const fusionSystem = new BattleFusionSystem();
  
  // Effect to show epic move details on first render
  useEffect(() => {
    if (battleActive && playerPokemon) {
      setTimeout(() => {
        toast.info("Try epic moves or fusion during battle!", { 
          duration: 5000,
          position: "bottom-center"
        });
      }, 2000);
    }
  }, [battleActive, playerPokemon]);
  
  // Handle Pokemon attack with enhanced animations
  const handleAttack = async (moveName: string) => {
    if (!battleActive || !playerPokemon || !opponentPokemon) return;
    
    // Determine if this is a special move
    const isSpecialMove = moveName.includes('Special') || 
      moveName.includes('Hyper') || 
      moveName.includes('Fusion') ||
      moveName.includes('Beam') ||
      moveName.includes('Blast');
      
    const isCritical = Math.random() < 0.2; // 20% chance for critical
    
    // Calculate damage (simplified)
    const baseDamage = isSpecialMove ? 30 : 15;
    const criticalMultiplier = isCritical ? 1.5 : 1.0;
    const damage = Math.floor(baseDamage * criticalMultiplier);
    
    // Choose animation type
    let animationType = AnimationType.NORMAL_ATTACK;
    
    if (isCritical) {
      animationType = AnimationType.CRITICAL_HIT;
    } else if (isSpecialMove) {
      animationType = AnimationType.SPECIAL_ATTACK;
    } else if (moveName.includes('Heavy') || moveName.includes('Slam')) {
      animationType = AnimationType.HEAVY_ATTACK;
    }
    
    // Play animation before damage is applied
    await playBattleAnimation(animationType, {
      attacker: playerPokemon.name,
      defender: opponentPokemon.name,
      moveName: moveName,
      damage: damage,
      effectiveness: isCritical ? "super effective" : "normal"
    });
    
    // Apply actual attack in the battle system
    attackOpponent(damage);
    
    // Check if opponent fainted
    if (opponentHealth - damage <= 0) {
      // Play victory animation
      setTimeout(async () => {
        await playBattleAnimation(AnimationType.VICTORY, {
          attacker: playerPokemon.name,
          defender: opponentPokemon.name,
          moveName: moveName
        });
        
        // End battle after animation
        endBattle();
      }, 500);
    }
  };
  
  // Handle Pokemon switching
  const handleSwitch = async () => {
    // Execute the switch command
    executeCommand('/switch', ['']);
  };
  
  // Handle Pokemon fusion
  const handleFusion = async () => {
    setShowFusionUI(!showFusionUI);
    setSelectedForFusion([]);
  };
  
  // Select Pokemon for fusion
  const selectForFusion = (index: number) => {
    if (selectedForFusion.includes(index)) {
      // Remove if already selected
      setSelectedForFusion(selectedForFusion.filter(i => i !== index));
    } else {
      // Add if not already selected (max 3)
      if (selectedForFusion.length < 3) {
        setSelectedForFusion([...selectedForFusion, index]);
      } else {
        toast.warning("Maximum 3 Pokemon can be fused together");
      }
    }
  };
  
  // Execute fusion with selected Pokemon
  const executeFusion = async () => {
    if (selectedForFusion.length < 2) {
      toast.error("Select at least 2 Pokemon for fusion");
      return;
    }
    
    // Convert to 1-based indices for command
    const fusionArgs = selectedForFusion.map(index => (index + 1).toString());
    executeCommand('/fuse', fusionArgs);
    
    // Hide fusion UI
    setShowFusionUI(false);
    setSelectedForFusion([]);
  };
  
  // Toggle move details
  const toggleMoveDetails = () => {
    setShowMoveDetails(!showMoveDetails);
  };

  if (!battleActive || !playerPokemon || !opponentPokemon) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-gray-500">No active battle</p>
          <button 
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => executeCommand('/battle', [])}
          >
            Start Battle
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gradient-to-b from-blue-900 to-purple-900 rounded-lg shadow-lg h-full">
      {/* Battle Arena */}
      <div className="relative h-72 mb-4 overflow-hidden bg-gradient-to-b from-green-800 to-green-600 rounded-lg">
        {/* Opponent Pokemon */}
        <div className="absolute top-4 right-4 w-40 h-40 flex items-center justify-center">
          <div className="transform hover:scale-110 transition-transform">
            <img 
              src={opponentPokemon.sprite || "https://via.placeholder.com/96"} 
              alt={opponentPokemon.name} 
              className="w-32 h-32 object-contain animate-pulse"
            />
          </div>
        </div>
        
        {/* Player Pokemon */}
        <div className="absolute bottom-4 left-4 w-40 h-40 flex items-center justify-center">
          <div className="transform hover:scale-110 transition-transform">
            <img 
              src={playerPokemon.sprite || "https://via.placeholder.com/96"} 
              alt={playerPokemon.name} 
              className="w-32 h-32 object-contain"
            />
          </div>
        </div>
        
        {/* Health Bars */}
        <div className="absolute top-2 left-2 w-1/3">
          <div className="text-sm font-bold text-white mb-1">
            {opponentPokemon.name} Lv.{opponentPokemon.level || '??'}
          </div>
          <div className="h-2 w-full bg-gray-300 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-red-500 to-red-600"
              style={{ width: `${(opponentHealth / opponentMaxHealth) * 100}%` }}
            ></div>
          </div>
          <div className="text-xs text-white mt-1">
            {opponentHealth}/{opponentMaxHealth} HP
          </div>
        </div>
        
        <div className="absolute bottom-2 right-2 w-1/3">
          <div className="text-sm font-bold text-white mb-1">
            {playerPokemon.name} Lv.{playerPokemon.level || '50'}
          </div>
          <div className="h-2 w-full bg-gray-300 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-green-600"
              style={{ width: `${(playerHealth / playerMaxHealth) * 100}%` }}
            ></div>
          </div>
          <div className="text-xs text-white mt-1">
            {playerHealth}/{playerMaxHealth} HP
          </div>
        </div>
      </div>
      
      {/* Battle Actions */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          onClick={() => handleAttack(playerPokemon.moves[0] || "Tackle")}
          className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition-colors"
        >
          Attack
        </button>
        <button
          onClick={handleSwitch}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors"
        >
          Switch
        </button>
        <button
          onClick={handleFusion}
          className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded transition-colors"
        >
          Fusion
        </button>
        <button
          onClick={toggleMoveDetails}
          className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded transition-colors"
        >
          {showMoveDetails ? "Hide Moves" : "Show Moves"}
        </button>
      </div>
      
      {/* Move List */}
      {showMoveDetails && (
        <div className="mb-4 p-3 bg-gray-800 bg-opacity-70 rounded-lg">
          <h3 className="text-white font-bold mb-2">Moves:</h3>
          <div className="grid grid-cols-2 gap-2">
            {playerPokemon.moves && playerPokemon.moves.length > 0 ? (
              playerPokemon.moves.map((move, index) => (
                <button
                  key={index}
                  onClick={() => handleAttack(move)}
                  className={`py-1 px-2 rounded text-sm text-white transition-colors ${
                    index % 4 === 0 ? "bg-red-500 hover:bg-red-600" :
                    index % 4 === 1 ? "bg-blue-500 hover:bg-blue-600" :
                    index % 4 === 2 ? "bg-green-500 hover:bg-green-600" :
                    "bg-yellow-500 hover:bg-yellow-600"
                  }`}
                >
                  {move}
                </button>
              ))
            ) : (
              <span className="text-gray-400 col-span-2">No moves available</span>
            )}
          </div>
        </div>
      )}
      
      {/* Fusion UI */}
      {showFusionUI && playerData && playerData.pokemon && (
        <div className="mb-4 p-3 bg-indigo-900 bg-opacity-70 rounded-lg">
          <h3 className="text-white font-bold mb-2">Select Pokemon for Fusion:</h3>
          <div className="grid grid-cols-3 gap-2">
            {playerData.pokemon.map((pokemon, index) => (
              <div 
                key={index}
                onClick={() => selectForFusion(index)}
                className={`p-2 rounded cursor-pointer transition-all ${
                  selectedForFusion.includes(index) 
                    ? "bg-indigo-600 border-2 border-white" 
                    : "bg-indigo-800 hover:bg-indigo-700"
                }`}
              >
                <img 
                  src={pokemon.sprite || "https://via.placeholder.com/48"} 
                  alt={pokemon.name}
                  className="w-12 h-12 object-contain mx-auto"
                />
                <div className="text-xs text-center text-white mt-1">{pokemon.name}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-center">
            <button
              onClick={executeFusion}
              disabled={selectedForFusion.length < 2}
              className={`py-2 px-4 rounded text-white ${
                selectedForFusion.length < 2 
                  ? "bg-gray-500 cursor-not-allowed" 
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              Fuse Pokemon ({selectedForFusion.length}/3)
            </button>
          </div>
        </div>
      )}
      
      {/* Battle Info */}
      <div className="p-3 bg-gray-800 bg-opacity-70 rounded-lg">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-xs text-gray-400">Your Pokemon:</span>
            <h3 className="text-white font-bold">{playerPokemon.name}</h3>
            <div className="flex space-x-1 mt-1">
              {playerPokemon.types?.map((type, index) => (
                <span 
                  key={index}
                  className={`text-xs px-2 py-0.5 rounded ${
                    type.toLowerCase() === 'fire' ? 'bg-red-500' :
                    type.toLowerCase() === 'water' ? 'bg-blue-500' :
                    type.toLowerCase() === 'grass' ? 'bg-green-500' :
                    type.toLowerCase() === 'electric' ? 'bg-yellow-500' :
                    type.toLowerCase() === 'psychic' ? 'bg-pink-500' :
                    'bg-gray-500'
                  }`}
                >
                  {type}
                </span>
              ))}
            </div>
          </div>
          
          <div className="text-right">
            <span className="text-xs text-gray-400">Opponent:</span>
            <h3 className="text-white font-bold">{opponentPokemon.name}</h3>
            <div className="flex space-x-1 mt-1 justify-end">
              {opponentPokemon.types?.map((type, index) => (
                <span 
                  key={index}
                  className={`text-xs px-2 py-0.5 rounded ${
                    type.toLowerCase() === 'fire' ? 'bg-red-500' :
                    type.toLowerCase() === 'water' ? 'bg-blue-500' :
                    type.toLowerCase() === 'grass' ? 'bg-green-500' :
                    type.toLowerCase() === 'electric' ? 'bg-yellow-500' :
                    type.toLowerCase() === 'psychic' ? 'bg-pink-500' :
                    'bg-gray-500'
                  }`}
                >
                  {type}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedBattleField;
