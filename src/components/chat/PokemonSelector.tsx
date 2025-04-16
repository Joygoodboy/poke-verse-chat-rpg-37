
import React from 'react';
import { Pokemon } from '@/types/gameTypes';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PokemonSelectorProps {
  party: Pokemon[];
  onSelect: (pokemon: Pokemon) => void;
}

export const PokemonSelector: React.FC<PokemonSelectorProps> = ({
  party,
  onSelect
}) => {
  if (!party || party.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">You don't have any Pokémon in your party!</p>
        <p className="text-sm mt-2">Use /spawn to spawn a Pokémon and then /catch to catch it</p>
      </div>
    );
  }
  
  return (
    <Card className="p-4 bg-gradient-to-r from-blue-800 to-indigo-900 text-white">
      <h3 className="text-lg font-bold mb-3">Select a Pokémon for battle</h3>
      <p className="text-sm mb-3">Click on a Pokémon to select it for battle, or use the command "/select [number]" (e.g., /select 0 for the first Pokémon)</p>
      <div className="grid grid-cols-2 gap-3">
        {party.map((pokemon, index) => (
          <div 
            key={index}
            className="bg-white/10 p-3 rounded-lg flex items-center cursor-pointer hover:bg-white/20 transition"
            onClick={() => onSelect(pokemon)}
          >
            {pokemon.image ? (
              <img src={pokemon.image} alt={pokemon.name} className="w-16 h-16 mr-3 object-contain" />
            ) : (
              <div className="w-16 h-16 bg-gray-700 rounded-full mr-3 flex items-center justify-center text-gray-400">?</div>
            )}
            <div>
              <div className="font-medium capitalize">{pokemon.name}</div>
              <div className="text-xs text-blue-200">Level {pokemon.level}</div>
              <div className="text-xs text-gray-300">Index: {index}</div>
              <Button 
                className="mt-2 text-xs py-0 px-2 h-6 bg-indigo-500 hover:bg-indigo-600"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(pokemon);
                }}
              >
                Select
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
