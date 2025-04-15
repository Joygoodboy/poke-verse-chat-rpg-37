
import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { ref, onChildAdded, push, set, get, child } from 'firebase/database';
import { createCommandSystem } from '../utils/gameCommands';
import { Pokemon } from '@/components/chat/PlayerInfo';
import { toast } from '@/hooks/use-toast';

export interface Message {
  user: string;
  text: string;
  image?: string | null;
}

export interface PlayerData {
  inventory: { pokeball: number, greatball: number, ultraball: number, masterball: number };
  wallet: number;
  bank: number;
  party: Pokemon[];
  pc: any[];
  lastSpawn: any;
  lastDailyClaim: number | null;
  xp: number;
  level: number;
  bonusUsed: boolean;
  lastSlotPlay: number | null;
  lastInterestClaim: number | null;
  bannedUsers: string[];
  lastRob: number | null;
}

// List of available commands for help menu
export const availableCommands = [
  { name: 'help', description: 'Show this help menu' },
  { name: 'slot', description: 'Play the slot machine (costs 50 coins)' },
  { name: 'wallet', description: 'Check your wallet balance' },
  { name: 'bank', description: 'Bank operations: deposit, withdraw, or check interest' },
  { name: 'daily', description: 'Claim your daily reward' },
  { name: 'shop', description: 'Visit the shop to buy items' },
  { name: 'buy', description: 'Buy an item from the shop' },
  { name: 'pokemonchallenge (pch)', description: 'Challenge another player to a Pokémon battle' },
  { name: 'challenge (ch)', description: 'Accept a battle challenge' },
  { name: 'battle', description: 'Use a move in battle' },
  { name: 'forfeit', description: 'Forfeit the current battle' },
  { name: 'spawn', description: 'Spawn a random Pokémon' },
  { name: 'catch', description: 'Try to catch a spawned Pokémon' },
  { name: 'party', description: 'View your Pokémon party' },
  { name: 'pc', description: 'View Pokémon in your PC' },
  { name: 't2pc', description: 'Transfer a Pokémon from party to PC' },
  { name: 't2party', description: 'Transfer a Pokémon from PC to party' },
  { name: 'rb', description: 'Start a random Pokémon battle' },
  { name: 'inventory', description: 'Check your inventory' },
  { name: 'release', description: 'Release a Pokémon from your party' },
  { name: 'ban', description: 'Ban a user (admin only)' },
  { name: 'unban', description: 'Unban a user (admin only)' },
  { name: 'owner', description: 'Show the list of owners' },
  { name: 'mods', description: 'Show the list of moderators' },
  { name: 'lb', description: 'Show the leaderboard of richest players' },
  { name: 'rob', description: 'Attempt to rob another player (risky!)' }
];

// Owner and moderator lists
export const OWNER_LIST = ["joyhostingbsite.com@gmail.com", "good", "Ash", "admin@pokemon.com", "owner@pokemon.com"];
export const ADMIN_LIST = ["Gary", "Professor Oak", "mod@pokemon.com", "moderator@pokemon.com"];

export const useChat = (username: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [playerData, setPlayerData] = useState<PlayerData>({
    inventory: { pokeball: 5, greatball: 0, ultraball: 0, masterball: 0 },
    wallet: 500,
    bank: 0,
    party: [],
    pc: [],
    lastSpawn: null,
    lastDailyClaim: null,
    xp: 0,
    level: 1,
    bonusUsed: false,
    lastSlotPlay: null,
    lastInterestClaim: null,
    bannedUsers: [],
    lastRob: null
  });
  
  const [allPlayers, setAllPlayers] = useState<Record<string, PlayerData>>({});

  // Load messages from Firebase
  useEffect(() => {
    const chatRef = ref(db, "chat");
    const unsubscribe = onChildAdded(chatRef, (snapshot) => {
      const message = snapshot.val();
      setMessages(prev => [...prev, message]);
    });

    // Load all players' data for leaderboard
    const playersRef = ref(db, "players");
    get(playersRef).then((snapshot) => {
      if (snapshot.exists()) {
        setAllPlayers(snapshot.val());
      }
    });

    // Load saved data for current player
    const savedData = localStorage.getItem("pokemonSave");
    if (savedData) {
      try {
        setPlayerData(JSON.parse(savedData));
      } catch (e) {
        console.error("Error loading saved data", e);
      }
    }

    return () => {
      unsubscribe();
    };
  }, []);

  // Save player data when it changes
  useEffect(() => {
    localStorage.setItem("pokemonSave", JSON.stringify(playerData));
    // Also save to Firebase for leaderboard
    const playerRef = ref(db, `players/${username}`);
    set(playerRef, playerData);
  }, [playerData, username]);

  const broadcast = (text: string, image: string | null = null) => {
    const chatRef = ref(db, "chat");
    push(chatRef, { user: username, text, image });
  };

  // Special handling for the help command
  const handleHelpCommand = () => {
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
/pokemonchallenge [username] or /pch [username] - Challenge player
/challenge accept or /ch accept - Accept a challenge
/battle [move-number] - Use a move in battle
/forfeit - Give up the battle

**👑 Admin:**
/ban [username] - Ban a user (admin only)
/unban [username] - Unban a user (admin only)
/owner - See who owns the game
/mods - See who moderates the game
`;
    broadcast(helpText);
  };

  // Leaderboard command
  const handleLeaderboardCommand = () => {
    if (Object.keys(allPlayers).length === 0) {
      broadcast("No players found for leaderboard yet.");
      return;
    }

    // Calculate total wealth (wallet + bank)
    const playerWealthList = Object.entries(allPlayers).map(([name, data]) => ({
      name,
      totalWealth: (data.wallet || 0) + (data.bank || 0)
    }));

    // Sort by total wealth in descending order
    playerWealthList.sort((a, b) => b.totalWealth - a.totalWealth);

    // Format leaderboard message
    let leaderboardText = "🏆 **Richest Players Leaderboard** 🏆\n\n";
    
    playerWealthList.slice(0, 10).forEach((player, index) => {
      const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}.`;
      leaderboardText += `${medal} ${player.name}: ${player.totalWealth} coins\n`;
    });

    broadcast(leaderboardText);
  };

  // Rob command
  const handleRobCommand = (targetUsername: string) => {
    if (!targetUsername) {
      broadcast("Usage: /rob [username]");
      return;
    }

    if (targetUsername === username) {
      broadcast("You can't rob yourself! 🤦");
      return;
    }

    // Check cooldown
    const now = Date.now();
    const robCooldown = 5 * 60 * 1000; // 5 minutes
    if (playerData.lastRob && now - playerData.lastRob < robCooldown) {
      const remainingTime = Math.ceil((robCooldown - (now - playerData.lastRob)) / 1000);
      broadcast(`🕒 You must wait ${remainingTime} seconds before attempting another robbery.`);
      return;
    }

    // Check if target exists
    if (!allPlayers[targetUsername]) {
      broadcast(`Player ${targetUsername} not found!`);
      return;
    }

    const targetPlayer = allPlayers[targetUsername];
    
    // Check if target has money
    if (targetPlayer.wallet <= 0) {
      broadcast(`${targetUsername} doesn't have any money to steal! 💸`);
      return;
    }

    // Calculate success chance (50%)
    const success = Math.random() < 0.5;
    
    // Calculate amount to steal (10-30% of target's wallet)
    const stealPercentage = Math.random() * 0.2 + 0.1;
    const stealAmount = Math.floor(targetPlayer.wallet * stealPercentage);

    setPlayerData(prev => ({
      ...prev,
      lastRob: now
    }));

    if (success) {
      // Update the target's wallet in Firebase
      const targetRef = ref(db, `players/${targetUsername}`);
      set(targetRef, {
        ...targetPlayer,
        wallet: targetPlayer.wallet - stealAmount
      });
      
      // Update player's wallet
      setPlayerData(prev => ({
        ...prev,
        wallet: prev.wallet + stealAmount
      }));
      
      broadcast(`🔫 You successfully robbed ${targetUsername} and got away with ${stealAmount} coins!`);
      
      // Add a message to the chat from "System" to announce the robbery
      const chatRef = ref(db, "chat");
      push(chatRef, { 
        user: "System", 
        text: `⚠️ ${username} robbed ${targetUsername} of ${stealAmount} coins and got away with it!` 
      });
    } else {
      // Calculate fine (50-100% of attempted theft)
      const finePercentage = Math.random() * 0.5 + 0.5;
      const fine = Math.floor(stealAmount * finePercentage);
      
      // Make sure fine doesn't exceed player's wallet
      const actualFine = Math.min(fine, playerData.wallet);
      
      setPlayerData(prev => ({
        ...prev,
        wallet: prev.wallet - actualFine
      }));
      
      broadcast(`🚨 You were caught trying to rob ${targetUsername}! The police fined you ${actualFine} coins.`);
      
      // System message about the failed robbery
      const chatRef = ref(db, "chat");
      push(chatRef, { 
        user: "System", 
        text: `👮 ${username} was caught attempting to rob ${targetUsername} and was fined ${actualFine} coins!` 
      });
    }
  };

  const handleCommand = (text: string) => {
    const args = text.split(" ");
    const command = args[0].toLowerCase().replace('/', '');
    
    // Handle special commands directly
    if (command === 'help') {
      handleHelpCommand();
      return;
    } else if (command === 'lb' || command === 'leaderboard') {
      handleLeaderboardCommand();
      return;
    } else if (command === 'rob') {
      handleRobCommand(args[1]);
      return;
    }
    
    // Continue to handle all other commands with the command system
    if (text.startsWith('/')) {
      return;
    }
  };

  const commandSystemRef = createCommandSystem(playerData, setPlayerData);

  return {
    messages,
    playerData,
    setPlayerData,
    broadcast,
    commandSystemRef,
    handleCommand
  };
};
