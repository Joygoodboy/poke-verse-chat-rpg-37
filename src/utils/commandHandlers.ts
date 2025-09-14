
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

// Import Slugterra commands
import {
  handleSlugSpawnCommand,
  handleSlugCatchCommand,
  handleSlugArsenalCommand,
  handleSlugHideoutCommand,
  handleSlugInfoCommand
} from './commands/slugterraCommands';

import {
  handleSlugChallengeCommand,
  handleSlugBattleCommand,
  handleSlugTrainCommand,
  handleSlugFuseCommand
} from './commands/slugterraBattleCommands';

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
  // Export Slugterra commands
  handleSlugSpawnCommand,
  handleSlugCatchCommand,
  handleSlugArsenalCommand,
  handleSlugHideoutCommand,
  handleSlugInfoCommand,
  handleSlugChallengeCommand,
  handleSlugBattleCommand,
  handleSlugTrainCommand,
  handleSlugFuseCommand,
  // Export admin commands
  handleGiveCoinsCommand,
  handleGivePokemonCommand,
  handleAnnouncementCommand
};
