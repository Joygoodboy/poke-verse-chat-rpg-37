
import { 
  handleHelpCommand,
  handleClearChatCommand,
  handleLogoutCommand
} from './commands/systemCommands';

import {
  handleLeaderboardCommand
} from './commands/economyCommands';

import {
  handleCatchCommand,
  handleSpawnCommand
} from './commands/pokemonCommands';

// Import admin commands from systemCommands
import {
  handleGiveCoinsCommand,
  handleGivePokemonCommand,
  handleAnnouncementCommand
} from './commands/systemCommands';

export {
  handleHelpCommand,
  handleLeaderboardCommand,
  handleCatchCommand,
  handleSpawnCommand,
  handleClearChatCommand,
  handleLogoutCommand,
  // Export admin commands
  handleGiveCoinsCommand,
  handleGivePokemonCommand,
  handleAnnouncementCommand
};
