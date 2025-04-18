
import React from 'react';
import EnhancedBattleField from './EnhancedBattleField';
import LeveledPokemonSpawner from './LeveledPokemonSpawner';

interface BattleFieldProps {
  battle: any;
  username: string;
  onMoveSelect: (moveIndex: number) => void;
  onForfeit: () => void;
  onPokemonStats: () => void;
}

// Updated BattleField to use our enhanced components
const BattleField: React.FC<BattleFieldProps> = ({
  battle,
  username,
  onMoveSelect,
  onForfeit,
  onPokemonStats
}) => {
  return (
    <div className="h-full relative">
      {/* Load the enhanced battle field */}
      <EnhancedBattleField 
        battle={battle}
        username={username}
        onMoveSelect={onMoveSelect}
        onForfeit={onForfeit}
        onPokemonStats={onPokemonStats}
      />
      
      {/* Pokemon spawner runs in the background */}
      <LeveledPokemonSpawner />
    </div>
  );
};

export default BattleField;
