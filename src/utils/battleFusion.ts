
import { PokemonFuser } from "../components/pokemonFuser";
import { ImageGenerator } from "../components/imageGenerator";
import { StorageManager } from "../components/storageManager";
import { toast } from "sonner";
import { playBattleAnimation, AnimationType } from "./battleAnimations";

export interface BattlePokemon {
  id: number;
  name: string;
  sprite: string;
  types: string[];
  stats: {
    hp: number;
    attack: number;
    defense: number;
    special_attack: number;
    special_defense: number;
    speed: number;
    [key: string]: number;
  };
  moves: string[];
  abilities: string[];
  level?: number;
  currentHp?: number;
  [key: string]: any;
}

export interface FusedPokemon extends BattlePokemon {
  parentPokemons: BattlePokemon[];
  fusionId: string;
}

export class BattleFusionSystem {
  private pokemonFuser: PokemonFuser;
  private imageGenerator: ImageGenerator;
  private storageManager: StorageManager;

  constructor() {
    this.pokemonFuser = new PokemonFuser();
    this.imageGenerator = new ImageGenerator();
    this.storageManager = new StorageManager();
  }

  /**
   * Creates a fusion from two or three Pokemon during battle
   */
  async fusePokemonInBattle(pokemons: BattlePokemon[]): Promise<FusedPokemon> {
    try {
      // Validate input
      if (pokemons.length < 2 || pokemons.length > 3) {
        throw new Error("Fusion requires 2 or 3 Pokemon");
      }

      // Format pokemons for the fuser
      const formattedPokemons = pokemons.map(pokemon => this.formatPokemonForFusion(pokemon));

      // Perform fusion animation before actual fusion
      await this.performFusionAnimation(pokemons);

      // Create the fusion using the PokemonFuser
      const fusionResult = await this.pokemonFuser.createFusion(
        formattedPokemons[0],
        formattedPokemons[1],
        formattedPokemons.length > 2 ? formattedPokemons[2] : null
      );

      // Generate a unique ID for the fusion
      const fusionId = `fusion_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

      // Transform fusion result into a battle-ready Pokemon
      const fusedPokemon: FusedPokemon = {
        id: this.generateFusionId(pokemons),
        name: fusionResult.name,
        sprite: fusionResult.image || pokemons[0].sprite, // Use the image from fusion or fallback
        types: fusionResult.type,
        stats: this.calculateFusionStats(pokemons),
        moves: this.generateFusionMoves(pokemons),
        abilities: fusionResult.abilities.map(ability => ability.name),
        level: this.calculateFusionLevel(pokemons),
        currentHp: 0, // Will be set to max HP when initialized
        parentPokemons: pokemons,
        fusionId: fusionId,
        description: fusionResult.description
      };

      // Set the current HP to max HP
      fusedPokemon.currentHp = fusedPokemon.stats.hp;

      // Save the fusion for future reference
      this.saveFusion(fusedPokemon);

      return fusedPokemon;
    } catch (error) {
      console.error("Error in fusePokemonInBattle:", error);
      toast.error("Failed to create Pokemon fusion. Please try again.");
      throw error;
    }
  }

  /**
   * Format Pokemon object to be compatible with the fusion system
   */
  private formatPokemonForFusion(pokemon: BattlePokemon): any {
    return {
      name: pokemon.name,
      types: pokemon.types.map(type => ({ type: { name: type } })),
      stats: Object.entries(pokemon.stats).map(([name, value]) => ({
        base_stat: value,
        stat: { name: name.replace("_", "-") }
      })),
      abilities: pokemon.abilities.map(ability => ({ ability: { name: ability } })),
      sprites: {
        front_default: pokemon.sprite,
        other: {
          "official-artwork": { front_default: pokemon.sprite },
          home: { front_default: pokemon.sprite }
        }
      },
      height: 10, // Default height
      weight: 100 // Default weight
    };
  }

  /**
   * Calculate the stats for the fused Pokemon
   */
  private calculateFusionStats(pokemons: BattlePokemon[]): BattlePokemon["stats"] {
    const totalStats: BattlePokemon["stats"] = {
      hp: 0,
      attack: 0,
      defense: 0,
      special_attack: 0,
      special_defense: 0,
      speed: 0
    };

    // Sum up all stats from parent Pokemon
    pokemons.forEach(pokemon => {
      Object.keys(totalStats).forEach(stat => {
        totalStats[stat] += pokemon.stats[stat];
      });
    });

    // Average the stats and apply a fusion bonus (20% boost)
    Object.keys(totalStats).forEach(stat => {
      totalStats[stat] = Math.floor((totalStats[stat] / pokemons.length) * 1.2);
      
      // Ensure minimum and maximum values
      totalStats[stat] = Math.max(10, Math.min(255, totalStats[stat]));
    });

    return totalStats;
  }

  /**
   * Generate a list of moves for the fused Pokemon
   */
  private generateFusionMoves(pokemons: BattlePokemon[]): string[] {
    // Collect all unique moves from parent Pokemon
    const allMoves = new Set<string>();
    pokemons.forEach(pokemon => {
      pokemon.moves.forEach(move => allMoves.add(move));
    });

    // Create fusion-specific special moves
    const fusionMoves = [
      `Fusion ${pokemons.map(p => p.types[0]).join("-")} Strike`,
      `${pokemons[0].name.slice(0, 3)}${pokemons[1].name.slice(0, 3)} Blast`
    ];

    // Combine regular moves with fusion moves (max 4 total)
    const combinedMoves = [...Array.from(allMoves).slice(0, 2), ...fusionMoves];
    return combinedMoves.slice(0, 4);
  }

  /**
   * Calculate the level for the fused Pokemon
   */
  private calculateFusionLevel(pokemons: BattlePokemon[]): number {
    // Get the average level of parent Pokemon, with a small boost
    const avgLevel = pokemons.reduce((sum, pokemon) => sum + (pokemon.level || 50), 0) / pokemons.length;
    const fusionLevel = Math.floor(avgLevel * 1.1);
    
    // Cap at level 100
    return Math.min(100, fusionLevel);
  }

  /**
   * Generate a unique ID for the fusion based on parent Pokemon
   */
  private generateFusionId(pokemons: BattlePokemon[]): number {
    // Create a deterministic but unique ID based on parent Pokemon IDs
    const baseId = pokemons.reduce((sum, pokemon) => sum + pokemon.id, 0);
    return baseId * 1000 + Math.floor(Math.random() * 1000);
  }

  /**
   * Play a fusion animation before completing the fusion
   */
  private async performFusionAnimation(pokemons: BattlePokemon[]): Promise<void> {
    // Get Pokemon names for the animation
    const pokemon1Name = pokemons[0].name;
    const pokemon2Name = pokemons[1].name;
    const fusedName = this.combineNames([pokemon1Name, pokemon2Name]);

    // Play the fusion animation
    await playBattleAnimation(AnimationType.FUSION, {
      attacker: pokemon1Name,
      defender: pokemon2Name,
      moveName: fusedName
    });

    // Return a promise that resolves after the animation
    return new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, 500); // Small buffer after animation
    });
  }

  /**
   * Save the fusion for future reference
   */
  private async saveFusion(fusedPokemon: FusedPokemon): Promise<void> {
    try {
      // Format fusion data for storage
      const fusionData = {
        id: fusedPokemon.fusionId,
        name: fusedPokemon.name,
        image: fusedPokemon.sprite,
        types: fusedPokemon.types,
        stats: fusedPokemon.stats,
        description: fusedPokemon.description,
        abilities: fusedPokemon.abilities.map(ability => ({
          name: ability,
          description: `A unique ability of ${fusedPokemon.name}`
        })),
        parentPokemon: {
          pokemon1Name: fusedPokemon.parentPokemons[0].name,
          pokemon2Name: fusedPokemon.parentPokemons[1].name,
          pokemon3Name: fusedPokemon.parentPokemons.length > 2 ? fusedPokemon.parentPokemons[2].name : null
        }
      };

      // Save to storage
      await this.storageManager.saveFusion(fusionData);
    } catch (error) {
      console.error("Error saving fusion:", error);
      // Non-critical error, just log
    }
  }

  /**
   * Helper function to combine Pokemon names
   */
  private combineNames(names: string[]): string {
    const filteredNames = names.filter(Boolean);
    
    if (filteredNames.length === 1) return filteredNames[0];
    
    // For 2+ Pokemon names, combine parts
    const firstParts = filteredNames.map(name => 
      name.slice(0, Math.ceil(name.length / filteredNames.length))
    );
    
    const combinedName = firstParts.join("");
    return combinedName.charAt(0).toUpperCase() + combinedName.slice(1);
  }
}
