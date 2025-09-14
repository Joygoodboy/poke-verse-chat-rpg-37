import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { usePlayerData } from '@/hooks/usePlayerData';
import { useCommandHandler } from '@/hooks/useCommandHandler';
import SlugBattleField from './SlugBattleField';
import { ExtendedPlayerData } from '@/types/gameTypes';

interface SlugterraChatIntegrationProps {
  username: string;
  onClose?: () => void;
}

const SlugterraChatIntegration: React.FC<SlugterraChatIntegrationProps> = ({
  username,
  onClose
}) => {
  const { playerData } = usePlayerData(username);
  const [currentView, setCurrentView] = useState<'overview' | 'battle' | 'arsenal'>('overview');

  const { handleCommand } = useCommandHandler({
    username,
    playerData: playerData || {},
    setPlayerData: () => {},
    broadcast: (message) => console.log('Slug broadcast:', message),
    logout: () => {},
    isAdmin: false,
    isOwner: false
  });

  const extendedPlayerData = playerData as ExtendedPlayerData;
  const slugData = extendedPlayerData?.slugData;

  const renderOverview = () => (
    <Card className="p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-amber-800 dark:text-amber-200">
          🐌 Slugterra Underground 🐌
        </h2>
        <p className="text-muted-foreground mt-2">
          Welcome to the world of Slugterra! Collect, train, and battle with powerful slugs.
        </p>
      </div>

      {!slugData ? (
        <div className="text-center space-y-4">
          <p className="text-lg">You haven't started your Slugterra journey yet!</p>
          <Button 
            onClick={() => handleCommand('/slugspawn')}
            size="lg"
            variant="default"
          >
            Spawn Your First Slug
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-4 text-center bg-yellow-50 dark:bg-yellow-950/20">
              <div className="text-2xl font-bold text-yellow-600">
                {slugData.slugCoins}
              </div>
              <div className="text-sm text-muted-foreground">Slug Coins</div>
            </Card>
            
            <Card className="p-4 text-center bg-green-50 dark:bg-green-950/20">
              <div className="text-2xl font-bold text-green-600">
                {slugData.energy}/100
              </div>
              <div className="text-sm text-muted-foreground">Energy</div>
            </Card>
            
            <Card className="p-4 text-center bg-blue-50 dark:bg-blue-950/20">
              <div className="text-2xl font-bold text-blue-600">
                {slugData.slugs.arsenal.length}/5
              </div>
              <div className="text-sm text-muted-foreground">Arsenal</div>
            </Card>
          </div>

          {/* Energy Bar */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Energy</span>
              <span>{slugData.energy}/100</span>
            </div>
            <Progress value={slugData.energy} className="h-3" />
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button 
              onClick={() => handleCommand('/slugspawn')}
              variant="default"
              size="sm"
            >
              Spawn Slug
            </Button>
            
            <Button 
              onClick={() => setCurrentView('arsenal')}
              variant="secondary" 
              size="sm"
            >
              View Arsenal
            </Button>
            
            <Button 
              onClick={() => setCurrentView('battle')}
              variant="outline"
              size="sm"
              disabled={!slugData.slugs.arsenal.length}
            >
              Battle Arena
            </Button>
            
            <Button 
              onClick={() => handleCommand('/slugtrain')}
              variant="ghost"
              size="sm"
              disabled={slugData.energy < 20}
            >
              Train Slug
            </Button>
          </div>

          {/* Last Spawned Slug */}
          {slugData.lastSlugSpawn && (
            <Card className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20">
              <h3 className="font-bold mb-2">Wild Slug Appeared!</h3>
              <div className="flex items-center gap-4">
                <img 
                  src={slugData.lastSlugSpawn.image}
                  alt={slugData.lastSlugSpawn.name}
                  className="w-16 h-16 rounded-lg"
                />
                <div className="flex-1">
                  <div className="font-medium">{slugData.lastSlugSpawn.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {slugData.lastSlugSpawn.element} • Level {slugData.lastSlugSpawn.level}
                  </div>
                  <Badge variant="secondary">{slugData.lastSlugSpawn.rarity}</Badge>
                </div>
                <Button 
                  onClick={() => handleCommand('/slugcatch')}
                  variant="default"
                >
                  Catch
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}
    </Card>
  );

  const renderArsenal = () => (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">🔫 Your Arsenal</h3>
        <Button 
          onClick={() => setCurrentView('overview')}
          variant="ghost"
          size="sm"
        >
          Back to Overview
        </Button>
      </div>

      {!slugData?.slugs.arsenal.length ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">Your arsenal is empty!</p>
          <Button onClick={() => handleCommand('/slugspawn')}>
            Spawn a Slug
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {slugData.slugs.arsenal.map((slug, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center gap-4">
                <img 
                  src={slug.image}
                  alt={slug.name}
                  className="w-12 h-12 rounded-lg"
                />
                <div className="flex-1">
                  <div className="font-medium">{slug.name}</div>
                  <div className="text-sm text-muted-foreground">
                    Level {slug.level} • {slug.element}
                  </div>
                  <Progress 
                    value={(slug.hp / slug.maxHp) * 100}
                    className="h-1 mt-1"
                  />
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{slug.hp}/{slug.maxHp} HP</div>
                  <Badge variant="secondary">{slug.rarity}</Badge>
                </div>
                <Button
                  onClick={() => handleCommand(`/sluginfo ${index + 1}`)}
                  variant="outline"
                  size="sm"
                >
                  Info
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Card>
  );

  const renderBattleArena = () => (
    <SlugBattleField 
      username={username}
      onBattleEnd={() => setCurrentView('overview')}
    />
  );

  return (
    <div className="h-full">
      {currentView === 'overview' && renderOverview()}
      {currentView === 'arsenal' && renderArsenal()}
      {currentView === 'battle' && renderBattleArena()}
    </div>
  );
};

export default SlugterraChatIntegration;