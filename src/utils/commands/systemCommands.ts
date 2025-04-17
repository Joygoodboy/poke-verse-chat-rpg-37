
import { ref, remove } from 'firebase/database';
import { db } from '../../firebase';

export const handleHelpCommand = (broadcast: (text: string) => void) => {
  const helpText = `
📖 **Available Commands:**

**💰 Economy:**
/wallet - Check your wallet balance
/bank [deposit/withdraw/interest] [amount] - Bank operations
/daily - Claim daily reward
/slot - Play the slot machine (costs 50 coins)
/shop - View items for sale
/buy [item] - Purchase an item
/lb - Show leaderboard of richest players
/rob [username] - Try to rob another player (risky!)

**🎮 Pokémon:**
/spawn - Spawn a random Pokémon
/catch [ball-type] - Try to catch a spawned Pokémon
/party - Check your Pokémon party
/pc - View Pokémon in your PC
/t2pc [index] - Transfer Pokémon to PC
/t2party [index] - Transfer Pokémon to party
/rb - Start a random battle
/release [index] - Release a Pokémon

**⚔️ Battle:**
/pokemonchallenge [username] or /pch [username] - Challenge player to a battle
/challenge accept or /ch accept - Accept a challenge
/select [number] - Select a Pokémon from your party for battle by its index
/battle [move-number] - Use a move in battle (e.g., /battle 1 for first move)
/pokemonstats or /pstats - View your Pokémon's battle stats and moves
/forfeit - Give up the battle

**👑 Admin:**
/ban [username] - Ban a user (admin only)
/unban [username] - Unban a user (admin only)
/clearchat - Clear all chat messages (admin only)
/owner - See who owns the game
/mods - See who moderates the game

**🔧 System:**
/logout - Log out from the game
`;
  broadcast(helpText);
};

export const handleClearChatCommand = async (
  username: string,
  isAdmin: boolean,
  broadcast: (text: string) => void
) => {
  if (!isAdmin) {
    broadcast("You don't have permission to use this command. Admin only.");
    return;
  }

  try {
    const chatRef = ref(db, "chat");
    await remove(chatRef);
    broadcast(`Chat history has been cleared by admin: ${username}`);
  } catch (error) {
    console.error("Error clearing chat:", error);
    broadcast("Failed to clear chat. Please try again later.");
  }
};

export const handleLogoutCommand = (
  broadcast: (text: string) => void,
  logout: () => void
) => {
  broadcast("Logging out...");
  setTimeout(() => {
    logout();
  }, 1000);
};
