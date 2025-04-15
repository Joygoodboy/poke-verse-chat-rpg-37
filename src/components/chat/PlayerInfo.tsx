
import React from 'react';
import { Card } from "@/components/ui/card";
import { User, Wallet, Package, Gamepad } from "lucide-react";

interface Pokemon {
  name: string;
  image?: string;
  level: number;
}

interface PlayerData {
  wallet: number;
  bank: number;
  inventory: {
    pokeball: number;
    greatball: number;
    ultraball: number;
    masterball: number;
  };
  party: Pokemon[];
}

interface PlayerInfoProps {
  username: string;
  playerData: PlayerData;
}

export const PlayerInfo: React.FC<PlayerInfoProps> = ({ username, playerData }) => {
  return (
    <div className="flex flex-col w-64 bg-blue-200/30 backdrop-blur-sm p-4 border-l border-blue-300 gap-4">
      <Card className="bg-yellow-100 border-2 border-yellow-300 p-4 text-blue-900">
        <h2 className="font-bold mb-3 flex items-center text-lg">
          <User className="mr-2" size={18} /> {username}
        </h2>
        <div className="flex justify-between items-center mb-2">
          <span className="flex items-center text-red-500 font-medium">
            <Wallet size={16} className="mr-2 text-red-500" /> Wallet
          </span>
          <span className="font-bold">{playerData.wallet} ₽</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="flex items-center text-blue-500 font-medium">
            <Wallet size={16} className="mr-2 text-blue-500" /> Bank
          </span>
          <span className="font-bold">{playerData.bank} ₽</span>
        </div>
      </Card>
      
      <Card className="bg-blue-100 border-2 border-blue-300 p-4 text-blue-900">
        <h2 className="font-bold mb-3 flex items-center text-lg">
          <Package className="mr-2" size={18} /> Inventory
        </h2>
        <div className="text-sm space-y-2">
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
            <span className="mr-1">Pokéballs:</span>
            <span className="font-bold">{playerData.inventory.pokeball}</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
            <span className="mr-1">Great:</span>
            <span className="font-bold">{playerData.inventory.greatball}</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-black mr-2"></div>
            <span className="mr-1">Ultra:</span>
            <span className="font-bold">{playerData.inventory.ultraball}</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-purple-500 mr-2"></div>
            <span className="mr-1">Master:</span>
            <span className="font-bold">{playerData.inventory.masterball}</span>
          </div>
        </div>
      </Card>
      
      <Card className="bg-blue-100 border-2 border-blue-300 p-4 text-blue-900 flex-1">
        <h2 className="font-bold mb-3 flex items-center text-lg">
          <Gamepad className="mr-2" size={18} /> Party
        </h2>
        
        {playerData.party.length === 0 ? (
          <div className="text-center italic text-gray-500 py-4">
            No Pokémon yet
          </div>
        ) : (
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {playerData.party.map((pokemon, index) => (
              <div key={index} className="flex items-center bg-white/50 rounded-lg p-2 shadow-sm">
                {pokemon.image ? (
                  <img src={pokemon.image} alt={pokemon.name} className="w-12 h-12 mr-3 object-contain" />
                ) : (
                  <div className="w-12 h-12 bg-gray-200 rounded-full mr-3 flex items-center justify-center text-gray-400">?</div>
                )}
                <div>
                  <div className="font-medium capitalize">{pokemon.name}</div>
                  <div className="text-xs">Level {pokemon.level}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
