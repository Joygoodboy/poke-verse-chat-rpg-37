import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { usePlayerData } from '@/hooks/usePlayerData';
import { useCommandHandler } from '@/hooks/useCommandHandler';
import { ExtendedPlayerData } from '@/types/gameTypes';

interface SlugBattleFieldProps {
  username: string;
  onBattleEnd?: () => void;
}

const SlugBattleField: React.FC<SlugBattleFieldProps> = ({
  username,
  onBattleEnd
}) => {
  const { playerData } = usePlayerData(username);
  const [selectedSlug, setSelectedSlug] = useState<number>(0);
  const [showMoves, setShowMoves] = useState(false);

  const { handleCommand } = useCommandHandler({
    username,
    playerData: playerData || {},
    setPlayerData: () => {},
    broadcast: () => {},
    logout: () => {},
    isAdmin: false,
    isOwner: false
  });
  const slugData = (playerData as ExtendedPlayerData)?.slugData;
  
  if (!slugData?.slugs.arsenal.length) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="p-8 text-center">
          <h3 className="text-xl font-bold mb-4">No Slugs Available</h3>
          <p className="text-muted-foreground mb-4">
            You need slugs in your arsenal to battle!
          </p>
          <Button 
            onClick={() => handleCommand('/slugspawn')}
            variant="default"
          >
            Spawn a Slug
          </Button>
        </Card>
      </div>
    );
  }

  const currentSlug = slugData.slugs.arsenal[selectedSlug];

  const getElementColor = (element: string) => {
    const colors: Record<string, string> = {
      'Fire': 'bg-red-500',
      'Water': 'bg-blue-500',
      'Air': 'bg-gray-400',
      'Earth': 'bg-amber-600',
      'Energy': 'bg-yellow-500',
      'Ice': 'bg-cyan-400',
      'Plant': 'bg-green-500',
      'Electric': 'bg-yellow-400',
      'Psychic': 'bg-purple-500',
      'Toxic': 'bg-purple-700',
      'Crystal': 'bg-pink-400',
      'Metal': 'bg-gray-600',
      'Shadow': 'bg-gray-900'
    };
    return colors[element] || 'bg-gray-500';
  };

  const getRarityColor = (rarity: string) => {
    const colors: Record<string, string> = {
      'common': 'bg-gray-400',
      'uncommon': 'bg-green-400',
      'rare': 'bg-blue-400',
      'ultra-rare': 'bg-purple-400',
      'legendary': 'bg-yellow-400'
    };
    return colors[rarity] || 'bg-gray-400';
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-amber-50 to-orange-100 dark:from-amber-950 dark:to-orange-950">
      {/* Header */}
      <div className="p-4 border-b bg-white/50 dark:bg-gray-900/50">
        <h2 className="text-2xl font-bold text-center text-amber-800 dark:text-amber-200">
          ⚡ Slugterra Battle Arena ⚡
        </h2>
      </div>

      {/* Main Battle Area */}
      <div className="flex-1 p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
          {/* Current Slug Display */}
          <Card className="p-6 bg-white/80 dark:bg-gray-900/80">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">{currentSlug.name}</h3>
              <img 
                src={currentSlug.image} 
                alt={currentSlug.name}
                className="w-32 h-32 mx-auto rounded-lg shadow-lg mb-4"
              />
              
              {/* Slug Stats */}
              <div className="space-y-3">
                <div className="flex justify-center gap-2">
                  <Badge className={`${getElementColor(currentSlug.element)} text-white`}>
                    {currentSlug.element}
                  </Badge>
                  <Badge className={`${getRarityColor(currentSlug.rarity)} text-white`}>
                    Level {currentSlug.level}
                  </Badge>
                  {currentSlug.isGhoul && (
                    <Badge variant="destructive">Ghoul</Badge>
                  )}
                </div>
                
                {/* Health Bar */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>HP</span>
                    <span>{currentSlug.hp}/{currentSlug.maxHp}</span>
                  </div>
                  <Progress 
                    value={(currentSlug.hp / currentSlug.maxHp) * 100}
                    className="h-3"
                  />
                </div>

                {/* XP Bar */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>XP</span>
                    <span>{currentSlug.xp}/{currentSlug.maxXp}</span>
                  </div>
                  <Progress 
                    value={(currentSlug.xp / currentSlug.maxXp) * 100}
                    className="h-2"
                  />
                </div>

                {/* Combat Stats */}
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="text-center">
                    <div className="font-bold text-red-600">ATK</div>
                    <div>{currentSlug.attack}</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-blue-600">DEF</div>
                    <div>{currentSlug.defense}</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-green-600">SPD</div>
                    <div>{currentSlug.speed}</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Battle Controls */}
          <Card className="p-6 bg-white/80 dark:bg-gray-900/80">
            <h3 className="text-xl font-bold mb-4">Battle Commands</h3>
            
            <div className="space-y-4">
              {/* Slug Selection */}
              <div>
                <label className="text-sm font-medium">Select Slug:</label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {slugData.slugs.arsenal.map((slug, index) => (
                    <Button
                      key={index}
                      variant={selectedSlug === index ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedSlug(index)}
                      className="text-xs"
                    >
                      {slug.name} (Lv.{slug.level})
                    </Button>
                  ))}
                </div>
              </div>

              {/* Move Selection */}
              <div>
                <Button
                  variant="secondary"
                  onClick={() => setShowMoves(!showMoves)}
                  className="w-full"
                >
                  {showMoves ? 'Hide Moves' : 'Show Moves'}
                </Button>
                
                {showMoves && (
                  <div className="mt-2 space-y-2">
                    {currentSlug.moves.map((move, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleCommand(`/slugbattle ${index + 1}`)}
                        className="w-full text-left"
                      >
                        <div>
                          <div className="font-medium">{move.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {move.damage} dmg • {move.type}
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                )}
              </div>

              {/* Battle Actions */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => handleCommand('/slugchallenge')}
                  variant="default"
                >
                  Challenge Player
                </Button>
                <Button
                  onClick={() => handleCommand('/slugtrain')}
                  variant="secondary"
                >
                  Train Slug
                </Button>
              </div>

              {/* Fusion Actions */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => handleCommand('/slugfuse')}
                  variant="outline"
                  disabled={slugData.slugs.arsenal.length < 2}
                >
                  Fuse Slugs
                </Button>
                <Button
                  onClick={() => handleCommand('/sluginfo ' + (selectedSlug + 1))}
                  variant="ghost"
                >
                  View Info
                </Button>
              </div>

              {/* Energy Display */}
              <Card className="p-3 bg-yellow-50 dark:bg-yellow-950/20">
                <div className="flex justify-between text-sm">
                  <span>Energy:</span>
                  <span className="font-bold">{slugData.energy}/100</span>
                </div>
                <Progress 
                  value={slugData.energy}
                  className="h-2 mt-1"
                />
              </Card>

              {/* Slug Coins */}
              <div className="text-center">
                <span className="text-lg font-bold text-yellow-600">
                  💰 {slugData.slugCoins} Slug Coins
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SlugBattleField;