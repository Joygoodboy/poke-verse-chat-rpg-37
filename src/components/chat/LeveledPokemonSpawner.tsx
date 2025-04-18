
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { StorageManager } from '../storageManager';
import { BattlePokemon } from '../../utils/battleFusion';

interface LeveledPokemonSpawnerProps {
  onPokemonSpawn?: (pokemon: BattlePokemon) => void;
}

const LeveledPokemonSpawner: React.FC<LeveledPokemonSpawnerProps> = ({ onPokemonSpawn }) => {
  const [spawned, setSpawned] = useState<BattlePokemon | null>(null);
  const [savedFusions, setSavedFusions] = useState<any[]>([]);
  const storageManager = new StorageManager();
  
  // Spawn a new Pokemon on component mount
  useEffect(() => {
    const spawnPokemon = async () => {
      try {
        // Load saved fusions to potentially spawn fused Pokemon
        const fusions = await storageManager.getAllFusions();
        setSavedFusions(fusions || []);
        
        // Determine if we spawn a regular or fused Pokemon (20% chance for fusion)
        const spawnFusion = Math.random() < 0.2 && fusions && fusions.length > 0;
        
        if (spawnFusion) {
          // Spawn a random fusion
          const randomFusion = fusions[Math.floor(Math.random() * fusions.length)];
          spawnFusedPokemon(randomFusion);
        } else {
          // Spawn a regular Pokemon
          spawnRegularPokemon();
        }
      } catch (error) {
        console.error("Error spawning Pokemon:", error);
      }
    };
    
    spawnPokemon();
    
    // Set up interval for periodic spawns (every 2 minutes)
    const interval = setInterval(spawnPokemon, 2 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Spawn a regular Pokemon
  const spawnRegularPokemon = async () => {
    try {
      // Fetch a random Pokemon from PokeAPI
      const randomId = Math.floor(Math.random() * 151) + 1; // Gen 1 for simplicity
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
      const data = await response.json();
      
      // Generate a random level between 5 and 70
      const level = Math.floor(Math.random() * 66) + 5;
      
      // Transform API data to our Pokemon format
      const newPokemon: BattlePokemon = {
        id: data.id,
        name: data.name,
        sprite: data.sprites.front_default,
        types: data.types.map((t: any) => t.type.name),
        stats: {
          hp: Math.floor((data.stats[0].base_stat * level) / 50) + level + 10,
          attack: Math.floor((data.stats[1].base_stat * level) / 50) + 5,
          defense: Math.floor((data.stats[2].base_stat * level) / 50) + 5,
          special_attack: Math.floor((data.stats[3].base_stat * level) / 50) + 5,
          special_defense: Math.floor((data.stats[4].base_stat * level) / 50) + 5,
          speed: Math.floor((data.stats[5].base_stat * level) / 50) + 5
        },
        moves: data.moves.slice(0, 4).map((m: any) => m.move.name),
        abilities: data.abilities.map((a: any) => a.ability.name),
        level: level
      };
      
      // Set as spawned Pokemon
      setSpawned(newPokemon);
      
      if (onPokemonSpawn) {
        onPokemonSpawn(newPokemon);
      }
      
      // Notify user
      toast.info(`A wild ${newPokemon.name} (Lv. ${level}) has appeared!`, {
        duration: 5000,
        position: "bottom-center"
      });
    } catch (error) {
      console.error("Error spawning regular Pokemon:", error);
    }
  };
  
  // Spawn a fused Pokemon
  const spawnFusedPokemon = (fusion: any) => {
    try {
      // Generate a random level between 30 and 85 (fused Pokemon are stronger)
      const level = Math.floor(Math.random() * 56) + 30;
      
      // Transform fusion data to our Pokemon format
      const newPokemon: BattlePokemon = {
        id: Math.floor(Math.random() * 10000) + 1000, // Random ID for fusion
        name: fusion.name,
        sprite: fusion.image,
        types: fusion.type || ["normal"],
        stats: {
          hp: Math.floor((fusion.stats.hp * level) / 40) + level + 20,
          attack: Math.floor((fusion.stats.attack * level) / 40) + 10,
          defense: Math.floor((fusion.stats.defense * level) / 40) + 10,
          special_attack: Math.floor((fusion.stats.special_attack * level) / 40) + 10,
          special_defense: Math.floor((fusion.stats.special_defense * level) / 40) + 10,
          speed: Math.floor((fusion.stats.speed * level) / 40) + 10
        },
        moves: fusion.abilities.map((a: any) => a.name) || ["Tackle", "Growl"],
        abilities: fusion.abilities.map((a: any) => a.name) || ["Unknown"],
        level: level,
        description: fusion.description,
        parentPokemon: fusion.parentPokemon
      };
      
      // Set as spawned Pokemon
      setSpawned(newPokemon);
      
      if (onPokemonSpawn) {
        onPokemonSpawn(newPokemon);
      }
      
      // Get parent Pokemon names for the toast
      const parentNames = [];
      if (fusion.parentPokemon?.pokemon1Name) parentNames.push(fusion.parentPokemon.pokemon1Name);
      if (fusion.parentPokemon?.pokemon2Name) parentNames.push(fusion.parentPokemon.pokemon2Name);
      if (fusion.parentPokemon?.pokemon3Name) parentNames.push(fusion.parentPokemon.pokemon3Name);
      
      // Notify user
      toast.info(
        `A fused ${newPokemon.name} (Lv. ${level}) has appeared! It's a fusion of ${parentNames.join(" and ")}!`, 
        {
          duration: 5000,
          position: "bottom-center"
        }
      );
    } catch (error) {
      console.error("Error spawning fused Pokemon:", error);
    }
  };
  
  return null; // This component doesn't render anything visible
};

export default LeveledPokemonSpawner;
