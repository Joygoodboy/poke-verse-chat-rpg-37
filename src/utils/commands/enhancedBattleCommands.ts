
import { BattleFusionSystem, BattlePokemon } from "../battleFusion";
import { EnhancedBattleSystem } from "../enhancedBattleSystem";
import { CommandHandler } from "./commandTypes";
import { CommentaryType, battleCommentary } from "../battleCommentary";
import { toast } from "sonner";

// Enhanced battle command handler
const enhancedBattleSystem = new EnhancedBattleSystem();
const fusionSystem = new BattleFusionSystem();

// Command to initiate Pokemon fusion during battle
export const fusePokemonCommand: CommandHandler = async (args, context) => {
  const { playerData, updateChatMessages } = context;
  
  if (!playerData || !playerData.pokemon || playerData.pokemon.length < 2) {
    return "You need at least two Pokemon in your party to perform fusion.";
  }
  
  // Check if args contain Pokemon indices or names
  let pokemonToFuse: BattlePokemon[] = [];
  
  if (args.length >= 2) {
    // Try to find Pokemon by index or name
    for (const arg of args) {
      const index = parseInt(arg) - 1; // Convert to 0-based index
      
      if (!isNaN(index) && index >= 0 && index < playerData.pokemon.length) {
        // Found by index
        pokemonToFuse.push(playerData.pokemon[index]);
      } else {
        // Try to find by name
        const foundPokemon = playerData.pokemon.find(
          p => p.name.toLowerCase() === arg.toLowerCase()
        );
        
        if (foundPokemon) {
          pokemonToFuse.push(foundPokemon);
        }
      }
    }
  }
  
  // If Pokemon not found by args, show fusion UI
  if (pokemonToFuse.length < 2) {
    return "Please specify which Pokemon to fuse by number or name (e.g., /fuse 1 2 or /fuse pikachu charizard)";
  }
  
  // Limit to max 3 Pokemon
  if (pokemonToFuse.length > 3) {
    pokemonToFuse = pokemonToFuse.slice(0, 3);
    toast.info("Maximum 3 Pokemon can be fused. Using the first 3 selected.");
  }
  
  try {
    // Perform fusion
    const fusedPokemon = await fusionSystem.fusePokemonInBattle(pokemonToFuse);
    
    // Update player's Pokemon
    const updatedPokemon = playerData.pokemon.filter(p => !pokemonToFuse.includes(p));
    updatedPokemon.push(fusedPokemon);
    
    // Update player data
    playerData.pokemon = updatedPokemon;
    
    // Generate fusion message
    const fusionMessage = battleCommentary.comment(CommentaryType.FUSION, {
      fusedPokemon: fusedPokemon.name,
      showToast: true
    });
    
    // Add system message
    if (updateChatMessages) {
      updateChatMessages(messages => [
        ...messages,
        {
          id: `fusion_${Date.now()}`,
          sender: "System",
          message: `🔄 ${fusionMessage}`,
          timestamp: new Date().toISOString(),
        }
      ]);
    }
    
    return `Fusion complete! ${pokemonToFuse.map(p => p.name).join(", ")} have been combined into ${fusedPokemon.name}!`;
  } catch (error) {
    console.error("Fusion error:", error);
    return "Fusion failed. Please try again.";
  }
};

// Command to switch active Pokemon during battle
export const switchPokemonCommand: CommandHandler = async (args, context) => {
  const { playerData, updateChatMessages } = context;
  
  if (!playerData || !playerData.pokemon || playerData.pokemon.length < 2) {
    return "You need at least two Pokemon in your party to switch.";
  }
  
  if (args.length < 1) {
    return "Please specify which Pokemon to switch to by number or name (e.g., /switch 2 or /switch charizard)";
  }
  
  const arg = args[0];
  let switchToPokemon: BattlePokemon | undefined;
  
  // Try to find by index
  const index = parseInt(arg) - 1; // Convert to 0-based index
  if (!isNaN(index) && index >= 0 && index < playerData.pokemon.length) {
    switchToPokemon = playerData.pokemon[index];
  } else {
    // Try to find by name
    switchToPokemon = playerData.pokemon.find(
      p => p.name.toLowerCase() === arg.toLowerCase()
    );
  }
  
  if (!switchToPokemon) {
    return `Pokemon "${arg}" not found in your party.`;
  }
  
  // Get current active Pokemon (first in list for this example)
  const currentPokemon = playerData.pokemon[0];
  
  if (switchToPokemon === currentPokemon) {
    return `${switchToPokemon.name} is already your active Pokemon.`;
  }
  
  // Swap Pokemon positions to make the selected one active
  const pokemonIndex = playerData.pokemon.indexOf(switchToPokemon);
  playerData.pokemon[0] = switchToPokemon;
  playerData.pokemon[pokemonIndex] = currentPokemon;
  
  // Generate switch message
  const switchMessage = battleCommentary.comment(CommentaryType.SWITCH, {
    attacker: "You",
    switchedFrom: currentPokemon.name,
    switchedTo: switchToPokemon.name,
    showToast: true
  });
  
  // Add system message
  if (updateChatMessages) {
    updateChatMessages(messages => [
      ...messages,
      {
        id: `switch_${Date.now()}`,
        sender: "System",
        message: `🔄 ${switchMessage}`,
        timestamp: new Date().toISOString(),
      }
    ]);
  }
  
  return `You withdrew ${currentPokemon.name} and sent out ${switchToPokemon.name}!`;
};

// Export all enhanced battle commands
export const enhancedBattleCommands = {
  fuse: fusePokemonCommand,
  fusion: fusePokemonCommand, // alias
  switch: switchPokemonCommand,
};
