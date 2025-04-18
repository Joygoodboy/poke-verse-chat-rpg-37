
import { systemCommands } from './systemCommands';
import { pokemonCommands } from './pokemonCommands';
import { economyCommands } from './economyCommands';
import { enhancedBattleCommands } from './enhancedBattleCommands';
import { CommandHandler } from '../commandHandlers';

// Extended commands object with our new enhanced battle commands
export const commands: Record<string, CommandHandler> = {
  // System commands
  help: systemCommands.help,
  clear: systemCommands.clear,
  
  // Pokemon commands
  catch: pokemonCommands.catch,
  list: pokemonCommands.list,
  battle: pokemonCommands.battle,
  info: pokemonCommands.info,
  release: pokemonCommands.release,
  
  // Economy commands
  money: economyCommands.money,
  balance: economyCommands.balance,
  shop: economyCommands.shop,
  buy: economyCommands.buy,
  
  // Enhanced Battle commands
  fuse: enhancedBattleCommands.fuse,
  fusion: enhancedBattleCommands.fusion,
  switch: enhancedBattleCommands.switch,
};

export default commands;
