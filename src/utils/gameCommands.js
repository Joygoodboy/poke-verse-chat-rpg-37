
// Command utilities for the Pokemon game
import { StorageManager } from "../components/storageManager";

export const createCommandSystem = (gameData, setGameData) => {
  const storageManager = new StorageManager();

  // Save game data after every command
  const saveGameDataAfterCommand = () => {
    setTimeout(() => {
      storageManager.saveGameData(gameData);
    }, 100);
  };

  // Enhanced slot command with improved feedback and visuals
  const slotCommand = () => {
    const betAmount = 50;
    if (gameData.wallet < betAmount) {
      return "Insufficient funds for slots! You need at least 50 coins.";
    }
    
    const now = Date.now();
    const cooldown = 60000; // 1 minute cooldown
    
    if (gameData.lastSlotPlay && now - gameData.lastSlotPlay < cooldown) {
      const remainingTime = Math.ceil((cooldown - (now - gameData.lastSlotPlay)) / 1000);
      return `Please wait ${remainingTime} seconds before playing again.`;
    }

    const symbols = ['7️⃣', '💎', '🍒', '⭐', '🎰', '💰', '🍇', '🎲'];
    const result = Array(3).fill().map(() => symbols[Math.floor(Math.random() * symbols.length)]);
    
    let multiplier = 0;
    let message = "";
    
    // Check for different winning combinations
    if (result.every(s => s === '7️⃣')) {
      multiplier = 15; // Jackpot!
      message = "JACKPOT! 🎉🎉🎉";
    } else if (result.every(s => s === '💎')) {
      multiplier = 10;
      message = "DIAMOND WIN! 💎💎💎";
    } else if (result.every(s => s === '💰')) {
      multiplier = 8;
      message = "BIG MONEY! 💰💰💰";
    } else if (result.every(s => s === result[0])) {
      multiplier = 5;
      message = "Triple Match! ✨";
    } else if (result[0] === result[1] || result[1] === result[2]) {
      multiplier = 2;
      message = "Double Match! 👍";
    } else if (result.includes('🎰')) {
      multiplier = 1;
      message = "Slot symbol bonus! 🎰";
    }

    const winAmount = betAmount * multiplier;
    
    setGameData(prev => {
      const updated = {
        ...prev,
        wallet: prev.wallet - betAmount + winAmount,
        lastSlotPlay: now
      };
      storageManager.saveGameData(updated);
      return updated;
    });

    const slotDisplay = `
╔═════════════╗
║   SLOTS!    ║
╠═════════════╣
║ ${result.join(' | ')} ║
╚═════════════╝
`;

    if (multiplier > 0) {
      return `${slotDisplay}\n${message}\nYou won ${winAmount} coins! 🎊`;
    } else {
      return `${slotDisplay}\nBetter luck next time! 🎲\nYou lost ${betAmount} coins.`;
    }
  };

  // Enhanced bank system with detailed feedback
  const bankCommand = (args) => {
    if (!args.length) {
      const interestRate = 5; // 5% interest rate
      return `
╔═════════════════════╗
║    BANK ACCOUNT     ║
╠═════════════════════╣
║ Balance: ${gameData.bank} coins    
║ Wallet:  ${gameData.wallet} coins    
║ Interest: ${interestRate}% daily    
╠═════════════════════╣
║ /bank deposit [amt] ║
║ /bank withdraw [amt]║
║ /bank interest      ║
╚═════════════════════╝
`;
    }

    const [action, amount] = args;
    const parsedAmount = parseInt(amount);

    switch (action) {
      case 'deposit':
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
          return "Please specify a valid amount to deposit.";
        }
        if (parsedAmount > gameData.wallet) {
          return "Insufficient funds in wallet.";
        }
        setGameData(prev => {
          const updated = {
            ...prev,
            wallet: prev.wallet - parsedAmount,
            bank: prev.bank + parsedAmount
          };
          storageManager.saveGameData(updated);
          return updated;
        });
        return `Deposit successful! 💸\nYou deposited ${parsedAmount} coins into your bank account.`;

      case 'withdraw':
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
          return "Please specify a valid amount to withdraw.";
        }
        if (parsedAmount > gameData.bank) {
          return "Insufficient funds in bank.";
        }
        setGameData(prev => {
          const updated = {
            ...prev,
            bank: prev.bank - parsedAmount,
            wallet: prev.wallet + parsedAmount
          };
          storageManager.saveGameData(updated);
          return updated;
        });
        return `Withdrawal successful! 💰\nYou withdrew ${parsedAmount} coins from your bank account.`;

      case 'interest':
        const now = Date.now();
        const lastInterest = gameData.lastInterestClaim || 0;
        const oneDay = 24 * 60 * 60 * 1000;
        
        if (now - lastInterest < oneDay) {
          const timeLeft = oneDay - (now - lastInterest);
          const hoursLeft = Math.floor(timeLeft / (60 * 60 * 1000));
          const minutesLeft = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
          return `Interest can be claimed in ${hoursLeft}h ${minutesLeft}m.`;
        }
        
        const interestRate = 0.05; // 5% daily interest
        const interestAmount = Math.floor(gameData.bank * interestRate);
        setGameData(prev => {
          const updated = {
            ...prev,
            bank: prev.bank + interestAmount,
            lastInterestClaim: now
          };
          storageManager.saveGameData(updated);
          return updated;
        });
        return `Interest payment received! 📈\nYou earned ${interestAmount} coins in interest!`;

      default:
        return "Invalid bank command. Use: /bank [deposit/withdraw/interest] [amount]";
    }
  };

  // Daily reward command with streak bonuses
  const dailyCommand = () => {
    const now = Date.now();
    const lastDaily = gameData.lastDailyClaim || 0;
    const oneDay = 24 * 60 * 60 * 1000;
    
    if (now - lastDaily < oneDay) {
      const timeLeft = oneDay - (now - lastDaily);
      const hoursLeft = Math.floor(timeLeft / (60 * 60 * 1000));
      const minutesLeft = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
      return `⏱️ You can claim your daily reward in ${hoursLeft}h ${minutesLeft}m.`;
    }
    
    // Check if this is a consecutive day (within 26-30 hours of last claim)
    const isConsecutiveDay = lastDaily > 0 && now - lastDaily < oneDay + 6 * 60 * 60 * 1000;
    
    // Calculate streaks for consecutive days
    const streakMultiplier = isConsecutiveDay ? Math.min(Math.floor((now - gameData.firstDailyStreak || now) / oneDay) + 1, 7) : 1;
    const baseReward = 500;
    const reward = baseReward * (1 + (streakMultiplier - 1) * 0.2); // 20% extra per streak day
    const xpReward = 100 * streakMultiplier;
    
    setGameData(prev => ({
      ...prev,
      wallet: prev.wallet + reward,
      xp: (prev.xp || 0) + xpReward,
      lastDailyClaim: now,
      firstDailyStreak: isConsecutiveDay ? (prev.firstDailyStreak || prev.lastDailyClaim || now) : now
    }));
    
    let streakMessage = "";
    if (streakMultiplier > 1) {
      streakMessage = `\n🔥 ${streakMultiplier}-day streak bonus applied!`;
    }
    
    return `
╔═════════════════════╗
║    DAILY REWARD     ║
╠═════════════════════╣
║ 💰 ${Math.floor(reward)} coins received!
║ ✨ ${xpReward} XP gained!${streakMessage}
╚═════════════════════╝
`;
  };

  // Shop command with improved visual display
  const shopCommand = () => {
    return `
╔═════════════════════╗
║      POKÉ SHOP      ║
╠═════════════════════╣
║ 🔴 Pokéball: 100 ₽   
║ 🔵 Great Ball: 250 ₽  
║ ⚫ Ultra Ball: 500 ₽  
║ 🟣 Master Ball: 1000 ₽
╠═════════════════════╣
║ Use /buy [item]     ║
╚═════════════════════╝
`;
  };

  // Buy command to purchase items
  const buyCommand = (args) => {
    if (!args.length) {
      return "Please specify an item to buy. Use /shop to see available items.";
    }
    
    const item = args[0].toLowerCase();
    const prices = {
      pokeball: 100,
      greatball: 250,
      ultraball: 500,
      masterball: 1000
    };
    
    // Handle alternative spellings
    let normalizedItem = item;
    if (item === "pb" || item === "poke" || item === "pokéball") normalizedItem = "pokeball";
    if (item === "gb" || item === "great") normalizedItem = "greatball";
    if (item === "ub" || item === "ultra") normalizedItem = "ultraball";
    if (item === "mb" || item === "master") normalizedItem = "masterball";
    
    if (!prices[normalizedItem]) {
      return `Invalid item. Available items: ${Object.keys(prices).join(', ')}`;
    }
    
    const price = prices[normalizedItem];
    if (gameData.wallet < price) {
      return `You don't have enough coins. ${normalizedItem} costs ${price} coins.`;
    }
    
    setGameData(prev => ({
      ...prev,
      wallet: prev.wallet - price,
      inventory: {
        ...prev.inventory,
        [normalizedItem]: (prev.inventory[normalizedItem] || 0) + 1
      }
    }));
    
    return `Purchase successful! 🛍️\nYou bought a ${normalizedItem} for ${price} coins.`;
  };

  // Wallet command to check balance with nice formatting
  const walletCommand = () => {
    return `
╔═════════════════════╗
║      FINANCES       ║
╠═════════════════════╣
║ 💰 Wallet: ${gameData.wallet} ₽    
║ 🏦 Bank: ${gameData.bank} ₽     
║ 💵 Total: ${gameData.wallet + gameData.bank} ₽    
╚═════════════════════╝
`;
  };

  // Inventory command with visual enhancements
  const inventoryCommand = () => {
    const inv = gameData.inventory;
    return `
╔═════════════════════╗
║      INVENTORY      ║
╠═════════════════════╣
║ 🔴 Pokéballs: ${inv.pokeball || 0}      
║ 🔵 Great Balls: ${inv.greatball || 0}    
║ ⚫ Ultra Balls: ${inv.ultraball || 0}    
║ 🟣 Master Balls: ${inv.masterball || 0}   
╚═════════════════════╝
`;
  };

  // Enhanced PC command
  const pcCommand = () => {
    if (!gameData.pc || gameData.pc.length === 0) {
      return "Your PC storage is empty. Catch some Pokémon and transfer them using /t2pc.";
    }
    
    let pcInfo = `
╔═════════════════════╗
║     PC STORAGE      ║
╠═════════════════════╣
`;
    
    gameData.pc.forEach((pokemon, index) => {
      pcInfo += `║ ${index}: ${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)} (Lvl ${pokemon.level})   \n`;
    });
    
    pcInfo += `╚═════════════════════╝
Use /t2party [number] to move to party.`;
    
    return pcInfo;
  };

  // Enhanced Party command
  const partyCommand = () => {
    if (gameData.party.length === 0) {
      return "Your party is empty! Catch some Pokémon first with /catch.";
    }
    
    let partyInfo = `
╔═════════════════════╗
║    POKÉMON PARTY    ║
╠═════════════════════╣
`;
    
    gameData.party.forEach((pokemon, index) => {
      partyInfo += `║ ${index}: ${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)} (Lvl ${pokemon.level})   \n`;
    });
    
    partyInfo += `╚═════════════════════╝
Use /t2pc [number] to move to PC.`;
    
    return partyInfo;
  };

  // Enhanced transfer to PC command
  const transferToPCCommand = (args) => {
    if (args.length === 0) {
      return "Usage: /t2pc [party_index]";
    }
    
    const index = parseInt(args[0]);
    if (isNaN(index) || index < 0 || index >= gameData.party.length) {
      return "Invalid party index. Use /party to see your Pokémon.";
    }
    
    setGameData(prev => {
      const updated = { ...prev };
      const pokemon = updated.party.splice(index, 1)[0];
      if (!updated.pc) updated.pc = [];
      updated.pc.push(pokemon);
      return updated;
    });
    
    return `Transferred ${gameData.party[index].name.charAt(0).toUpperCase() + gameData.party[index].name.slice(1)} to PC storage.`;
  };

  // Enhanced transfer to Party command
  const transferToPartyCommand = (args) => {
    if (args.length === 0) {
      return "Usage: /t2party [pc_index]";
    }
    
    const index = parseInt(args[0]);
    if (isNaN(index) || index < 0 || !gameData.pc || index >= gameData.pc.length) {
      return "Invalid PC index. Use /pc to see your stored Pokémon.";
    }
    
    if (gameData.party.length >= 6) {
      return "Your party is full! (Max: 6 Pokémon) Transfer some to PC first.";
    }
    
    setGameData(prev => {
      const updated = { ...prev };
      const pokemon = updated.pc.splice(index, 1)[0];
      updated.party.push(pokemon);
      return updated;
    });
    
    return `Transferred ${gameData.pc[index].name.charAt(0).toUpperCase() + gameData.pc[index].name.slice(1)} to your party.`;
  };

  // Enhanced random battle command
  const randomBattleCommand = () => {
    if (gameData.party.length === 0) {
      return "You need Pokémon in your party to battle! Catch some first.";
    }
    
    const wildLevel = Math.floor(Math.random() * 5) + Math.max(1, gameData.party[0].level - 2);
    const playerPokemon = gameData.party[0];
    
    // More sophisticated battle calculation based on levels
    const playerStrength = playerPokemon.level;
    const wildStrength = wildLevel;
    const playerAdvantage = playerStrength > wildStrength ? (playerStrength - wildStrength) * 0.05 : 0;
    
    const winChance = 0.5 + playerAdvantage;
    const result = Math.random() < winChance;
    
    // Wild Pokémon name
    const wildPokemonNames = ["Pidgey", "Rattata", "Caterpie", "Weedle", "Spearow", "Ekans", "Sandshrew", "Zubat"];
    const wildPokemonName = wildPokemonNames[Math.floor(Math.random() * wildPokemonNames.length)];
    
    if (result) {
      // Calculate rewards based on level difference
      const baseCoins = 50;
      const levelBonus = Math.max(0, wildLevel - playerPokemon.level) * 20;
      const rewardCoins = baseCoins + levelBonus;
      
      const baseXP = 15;
      const xpBonus = Math.max(0, wildLevel - playerPokemon.level) * 5;
      const rewardXP = baseXP + xpBonus;
      
      // Check if Pokémon leveled up
      const currentXP = playerPokemon.xp || 0;
      const xpToNextLevel = playerPokemon.level * 40;
      const newXP = currentXP + rewardXP;
      const leveledUp = newXP >= xpToNextLevel;
      
      setGameData(prev => ({
        ...prev,
        wallet: prev.wallet + rewardCoins,
        party: prev.party.map((pokemon, index) => 
          index === 0 
            ? { 
                ...pokemon, 
                xp: leveledUp ? newXP - xpToNextLevel : newXP, 
                level: leveledUp ? pokemon.level + 1 : pokemon.level 
              } 
            : pokemon
        )
      }));
      
      let battleLog = `
╔═════════════════════╗
║    BATTLE REPORT    ║
╠═════════════════════╣
║ Your ${playerPokemon.name.charAt(0).toUpperCase() + playerPokemon.name.slice(1)} (Lv.${playerPokemon.level})
║ vs Wild ${wildPokemonName} (Lv.${wildLevel})
╠═════════════════════╣
║ 🏆 VICTORY! 🏆
║ Rewards: ${rewardCoins} coins, ${rewardXP} XP
`;
      
      if (leveledUp) {
        battleLog += `║ 🎉 LEVEL UP! 🎉
║ ${playerPokemon.name.charAt(0).toUpperCase() + playerPokemon.name.slice(1)} is now level ${playerPokemon.level + 1}!
`;
      }
      
      battleLog += `╚═════════════════════╝`;
      return battleLog;
    } else {
      return `
╔═════════════════════╗
║    BATTLE REPORT    ║
╠═════════════════════╣
║ Your ${playerPokemon.name.charAt(0).toUpperCase() + playerPokemon.name.slice(1)} (Lv.${playerPokemon.level})
║ vs Wild ${wildPokemonName} (Lv.${wildLevel})
╠═════════════════════╣
║ ❌ DEFEAT! ❌
║ Your Pokémon needs more training!
╚═════════════════════╝
`;
    }
  };

  // Ban command for admins
  const banCommand = (args, userData = {}) => {
    if (!args.length) {
      return "Please specify a username to ban.";
    }
    
    if (!userData.isOwner && !userData.isAdmin) {
      return "❌ You don't have permission to use this command.";
    }
    
    const targetUser = args[0];
    const reason = args.slice(1).join(" ") || "No reason provided";
    
    // In a real implementation, this would interact with a database
    setGameData(prev => {
      const updated = {
        ...prev,
        bannedUsers: [...(prev.bannedUsers || []), targetUser]
      };
      storageManager.saveGameData(updated);
      return updated;
    });
    
    return `🔨 User ${targetUser} has been banned. Reason: ${reason}`;
  };

  // Unban command for admins
  const unbanCommand = (args, userData = {}) => {
    if (!args.length) {
      return "Please specify a username to unban.";
    }
    
    if (!userData.isOwner && !userData.isAdmin) {
      return "❌ You don't have permission to use this command.";
    }
    
    const targetUser = args[0];
    
    setGameData(prev => {
      const updated = {
        ...prev,
        bannedUsers: (prev.bannedUsers || []).filter(user => user.toLowerCase() !== targetUser.toLowerCase())
      };
      storageManager.saveGameData(updated);
      return updated;
    });
    
    return `✅ User ${targetUser} has been unbanned.`;
  };

  // Owner command to display owners
  const ownerCommand = () => {
    const owners = ["joyhostingbsite.com@gmail.com", "good", "Ash", "admin@pokemon.com", "owner@pokemon.com"];
    return `
╔═════════════════════╗
║    GAME OWNERS      ║
╠═════════════════════╣
${owners.map(owner => `║ 👑 ${owner}`).join('\n')}
╚═════════════════════╝
`;
  };

  // Mods command to display moderators
  const modsCommand = () => {
    const mods = ["Gary", "Professor Oak", "mod@pokemon.com", "moderator@pokemon.com"];
    return `
╔═════════════════════╗
║    MODERATORS       ║
╠═════════════════════╣
${mods.map(mod => `║ 🛡️ ${mod}`).join('\n')}
╚═════════════════════╝
`;
  };

  // Move command to reorder party Pokemon
  const moveCommand = (args) => {
    if (args.length < 2) {
      return "Please provide two positions to swap: /move [pos1] [pos2]";
    }
    
    const pos1 = parseInt(args[0]);
    const pos2 = parseInt(args[1]);
    
    if (isNaN(pos1) || isNaN(pos2) || 
        pos1 < 0 || pos2 < 0 || 
        pos1 >= gameData.party.length || pos2 >= gameData.party.length) {
      return "Invalid positions. Use numbers within your party range.";
    }
    
    setGameData(prev => {
      const newParty = [...prev.party];
      [newParty[pos1], newParty[pos2]] = [newParty[pos2], newParty[pos1]];
      return {
        ...prev,
        party: newParty
      };
    });
    
    return `Swapped positions ${pos1} and ${pos2} in your party.`;
  };

  // Release command to free a Pokemon
  const releaseCommand = (args) => {
    if (!args.length) {
      return "Please specify which Pokemon to release by its position in your party.";
    }
    
    const position = parseInt(args[0]);
    
    if (isNaN(position) || position < 0 || position >= gameData.party.length) {
      return "Invalid position. Use a number within your party range.";
    }
    
    const pokemonName = gameData.party[position].name;
    
    setGameData(prev => {
      const newParty = [...prev.party];
      newParty.splice(position, 1);
      return {
        ...prev,
        party: newParty,
        wallet: prev.wallet + 50 // Small compensation for releasing
      };
    });
    
    return `You released ${pokemonName.charAt(0).toUpperCase() + pokemonName.slice(1)} back into the wild and received 50 coins as compensation.`;
  };

  // Object with all commands
  const commands = {
    slot: slotCommand,
    bank: bankCommand,
    daily: dailyCommand,
    shop: shopCommand,
    buy: buyCommand,
    wallet: walletCommand,
    inventory: inventoryCommand,
    save: () => {
      localStorage.setItem("pokemonSave", JSON.stringify(gameData));
      return "✅ Game saved successfully!";
    },
    load: () => {
      const savedData = localStorage.getItem("pokemonSave");
      if (!savedData) {
        return "❌ No saved game found.";
      }
      
      try {
        const parsedData = JSON.parse(savedData);
        setGameData(parsedData);
        return "✅ Game loaded successfully!";
      } catch (error) {
        return "❌ Error loading saved game.";
      }
    },
    ban: banCommand,
    unban: unbanCommand,
    owner: ownerCommand,
    mods: modsCommand,
    move: moveCommand,
    release: releaseCommand,
    party: partyCommand,
    pc: pcCommand,
    t2pc: transferToPCCommand,
    t2party: transferToPartyCommand,
    rb: randomBattleCommand
  };

  return commands;
};

// Helper function to format command output
export const formatCommandOutput = (output) => {
  if (typeof output === 'string') {
    return output;
  }
  return JSON.stringify(output);
};

// Helper function to check if a user has admin privileges
export const isAdminUser = (username, owners = [], admins = []) => {
  if (!username) return false;
  const lowerUsername = username.toLowerCase();
  return owners.some(owner => owner.toLowerCase() === lowerUsername) || 
         admins.some(admin => admin.toLowerCase() === lowerUsername);
};

// Helper function to check if a user is an owner
export const isOwnerUser = (username, owners = []) => {
  if (!username) return false;
  const lowerUsername = username.toLowerCase();
  return owners.some(owner => owner.toLowerCase() === lowerUsername);
};
