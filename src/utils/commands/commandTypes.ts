// Define command handler type to fix import issues
export type CommandHandler = (
  args: string[], 
  context: {
    playerData: any;
    updateChatMessages?: (updater: (messages: any[]) => any[]) => void;
  }
) => Promise<string> | string;

// Export system command handlers
export const systemCommands = {
  help: async () => "Help command executed",
  clear: async () => "Chat cleared",
};

// Export pokemon command handlers
export const pokemonCommands = {
  catch: async () => "Catch command executed",
  list: async () => "List command executed", 
  battle: async () => "Battle command executed",
  info: async () => "Info command executed",
  release: async () => "Release command executed",
};

// Export economy command handlers
export const economyCommands = {
  money: async () => "Money command executed",
  balance: async () => "Balance command executed",
  shop: async () => "Shop command executed", 
  buy: async () => "Buy command executed",
};