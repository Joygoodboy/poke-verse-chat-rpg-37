
import React from 'react';
import EnhancedBattleField from './EnhancedBattleField';
import LeveledPokemonSpawner from './LeveledPokemonSpawner';

// Updated BattleField to use our enhanced components
const BattleField: React.FC = () => {
  return (
    <div className="h-full relative">
      {/* Load the enhanced battle field */}
      <EnhancedBattleField />
      
      {/* Pokemon spawner runs in the background */}
      <LeveledPokemonSpawner />
    </div>
  );
};

export default BattleField;
