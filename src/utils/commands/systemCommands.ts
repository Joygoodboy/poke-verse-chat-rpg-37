
import { ref, remove, get, set } from 'firebase/database';
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

**🐌 Slugterra:**
/slugspawn - Spawn a wild slug
/slugcatch - Try to catch a spawned slug
/slugarsenal or /arsenal - View your slugs
/slughideout or /hideout - View slugs in hideout
/sluginfo [number] - View detailed slug info
/slugchallenge [username] or /slugduel [username] - Challenge to slug battle
/slugbattle [move-number] - Use a move in slug battle
/slugtrain [number] - Train a specific slug (costs energy)
/slugfuse [slug1] [slug2] - Fuse two slugs together

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

// New admin commands

export const handleGiveCoinsCommand = async (
  username: string,
  targetUser: string,
  amount: number,
  isAdmin: boolean,
  broadcast: (text: string) => void
) => {
  if (!isAdmin) {
    broadcast("You don't have permission to use this command. Admin only.");
    return;
  }

  if (!targetUser || isNaN(amount) || amount <= 0) {
    broadcast("Usage: /givecoins [username] [amount]");
    return;
  }

  try {
    // Check if target user exists
    const userRef = ref(db, `players/${targetUser}`);
    const snapshot = await get(userRef);
    
    if (!snapshot.exists()) {
      broadcast(`User ${targetUser} not found.`);
      return;
    }
    
    const userData = snapshot.val();
    const currentWallet = userData.wallet || 0;
    
    // Update wallet
    await set(ref(db, `players/${targetUser}/wallet`), currentWallet + amount);
    
    broadcast(`🎁 Admin ${username} has given ${amount} coins to ${targetUser}!`);
  } catch (error) {
    console.error("Error giving coins:", error);
    broadcast("Failed to give coins. Please try again later.");
  }
};

export const handleGivePokemonCommand = async (
  username: string,
  targetUser: string,
  pokemonName: string,
  level: number,
  isAdmin: boolean,
  broadcast: (text: string) => void
) => {
  if (!isAdmin) {
    broadcast("You don't have permission to use this command. Admin only.");
    return;
  }

  if (!targetUser || !pokemonName || isNaN(level) || level <= 0) {
    broadcast("Usage: /givepokemon [username] [pokemon_name] [level]");
    return;
  }

  try {
    // Check if target user exists
    const userRef = ref(db, `players/${targetUser}`);
    const snapshot = await get(userRef);
    
    if (!snapshot.exists()) {
      broadcast(`User ${targetUser} not found.`);
      return;
    }
    
    const userData = snapshot.val();
    const party = userData.party || [];
    
    // Create new pokemon
    const newPokemon = {
      name: pokemonName,
      level: level,
      xp: 0,
      health: level * 20,
      maxHealth: level * 20,
      image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${Math.floor(Math.random() * 898) + 1}.png`
    };
    
    // Add to party
    party.push(newPokemon);
    await set(ref(db, `players/${targetUser}/party`), party);
    
    broadcast(`🎁 Admin ${username} has given a level ${level} ${pokemonName} to ${targetUser}!`);
  } catch (error) {
    console.error("Error giving pokemon:", error);
    broadcast("Failed to give Pokemon. Please try again later.");
  }
};

export const handleAnnouncementCommand = async (
  username: string,
  message: string,
  isAdmin: boolean,
  broadcast: (text: string) => void
) => {
  if (!isAdmin) {
    broadcast("You don't have permission to use this command. Admin only.");
    return;
  }

  if (!message) {
    broadcast("Usage: /announce [message]");
    return;
  }

  try {
    broadcast(`📢 **ADMIN ANNOUNCEMENT** 📢\n${message}\n— ${username}`);
  } catch (error) {
    console.error("Error making announcement:", error);
    broadcast("Failed to make announcement. Please try again later.");
  }
};
