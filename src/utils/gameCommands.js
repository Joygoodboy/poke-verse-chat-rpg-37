// Command utilities for the Pokemon game
export const createCommandSystem = (gameData, setGameData) => {
  // Enhanced slot command with improved feedback and cooldown
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

    const symbols = ['7️⃣', '💎', '🍒', '⭐', '🎰'];
    const result = Array(3).fill().map(() => symbols[Math.floor(Math.random() * symbols.length)]);
    
    let multiplier = 0;
    if (result.every(s => s === '7️⃣')) multiplier = 10;
    else if (result.every(s => s === '💎')) multiplier = 7;
    else if (result.every(s => s === result[0])) multiplier = 5;
    else if (result[0] === result[1] || result[1] === result[2]) multiplier = 2;

    const winAmount = betAmount * multiplier;
    
    setGameData(prev => ({
      ...prev,
      wallet: prev.wallet - betAmount + winAmount,
      lastSlotPlay: now
    }));

    return `🎰 | ${result.join(' | ')} | 🎰 ${multiplier > 0 ? `\nYou won ${winAmount} coins!` : '\nBetter luck next time!'}`;
  };

  // Enhanced bank system with detailed feedback
  const bankCommand = (args) => {
    if (!args.length) {
      return `Bank Balance: ${gameData.bank} coins\nWallet: ${gameData.wallet} coins\nUse /bank [deposit/withdraw/interest] [amount]`;
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
        setGameData(prev => ({
          ...prev,
          wallet: prev.wallet - parsedAmount,
          bank: prev.bank + parsedAmount
        }));
        return `Successfully deposited ${parsedAmount} coins.`;

      case 'withdraw':
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
          return "Please specify a valid amount to withdraw.";
        }
        if (parsedAmount > gameData.bank) {
          return "Insufficient funds in bank.";
        }
        setGameData(prev => ({
          ...prev,
          bank: prev.bank - parsedAmount,
          wallet: prev.wallet + parsedAmount
        }));
        return `Successfully withdrew ${parsedAmount} coins.`;

      case 'interest':
        const now = Date.now();
        const lastInterest = gameData.lastInterestClaim || 0;
        const oneDay = 24 * 60 * 60 * 1000;
        
        if (now - lastInterest < oneDay) {
          const timeLeft = oneDay - (now - lastInterest);
          const hoursLeft = Math.floor(timeLeft / (60 * 60 * 1000));
          return `Interest can be claimed in ${hoursLeft} hours.`;
        }
        
        const interestRate = 0.05; // 5% daily interest
        const interestAmount = Math.floor(gameData.bank * interestRate);
        setGameData(prev => ({
          ...prev,
          bank: prev.bank + interestAmount,
          lastInterestClaim: now
        }));
        return `You earned ${interestAmount} coins in interest!`;

      default:
        return "Invalid bank command. Use: /bank [deposit/withdraw/interest] [amount]";
    }
  };

  // Daily reward command
  const dailyCommand = () => {
    const now = Date.now();
    const lastDaily = gameData.lastDailyClaim || 0;
    const oneDay = 24 * 60 * 60 * 1000;
    
    if (now - lastDaily < oneDay) {
      const timeLeft = oneDay - (now - lastDaily);
      const hoursLeft = Math.floor(timeLeft / (60 * 60 * 1000));
      const minutesLeft = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
      return `You can claim your daily reward in ${hoursLeft}h ${minutesLeft}m.`;
    }
    
    const reward = 500;
    const xpReward = 100;
    
    setGameData(prev => ({
      ...prev,
      wallet: prev.wallet + reward,
      xp: (prev.xp || 0) + xpReward,
      lastDailyClaim: now
    }));
    
    return `🎁 You claimed your daily reward of ${reward} coins and ${xpReward} XP!`;
  };

  // Shop command to display available items
  const shopCommand = () => {
    return `🛒 PokéShop Prices:
• Pokéball: 100 coins
• Great Ball: 250 coins
• Ultra Ball: 500 coins 
• Master Ball: 1000 coins
Use /buy [item] to purchase.`;
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
    
    if (!prices[item]) {
      return `Invalid item. Available items: ${Object.keys(prices).join(', ')}`;
    }
    
    const price = prices[item];
    if (gameData.wallet < price) {
      return `You don't have enough coins. ${item} costs ${price} coins.`;
    }
    
    setGameData(prev => ({
      ...prev,
      wallet: prev.wallet - price,
      inventory: {
        ...prev.inventory,
        [item]: (prev.inventory[item] || 0) + 1
      }
    }));
    
    return `You bought a ${item} for ${price} coins.`;
  };

  // Wallet command to check balance
  const walletCommand = () => {
    return `💰 Wallet: ${gameData.wallet} coins\n🏦 Bank: ${gameData.bank} coins`;
  };

  // Inventory command to check items
  const inventoryCommand = () => {
    const inv = gameData.inventory;
    return `🎒 Your Inventory:
• Pokéballs: ${inv.pokeball || 0}
• Great Balls: ${inv.greatball || 0}
• Ultra Balls: ${inv.ultraball || 0}
• Master Balls: ${inv.masterball || 0}`;
  };

  // Save game command
  const saveCommand = () => {
    localStorage.setItem("pokemonSave", JSON.stringify(gameData));
    return "✅ Game saved successfully!";
  };

  // Load game command
  const loadCommand = () => {
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
  };

  // Broadcast command for admins to send global messages
  const broadcastCommand = (args, userData = {}) => {
    if (!args.length) {
      return "Please provide a message to broadcast.";
    }
    
    if (!userData.isOwner && !userData.isAdmin) {
      return "You don't have permission to use this command.";
    }
    
    const message = args.join(" ");
    return `[BROADCAST] ${message}`;
  };

  // Ban command for admins
  const banCommand = (args, userData = {}) => {
    if (!args.length) {
      return "Please specify a username to ban.";
    }
    
    if (!userData.isOwner && !userData.isAdmin) {
      return "You don't have permission to use this command.";
    }
    
    const targetUser = args[0];
    const reason = args.slice(1).join(" ") || "No reason provided";
    
    // In a real implementation, this would interact with a database
    return `User ${targetUser} has been banned. Reason: ${reason}`;
  };

  // Unban command for admins
  const unbanCommand = (args, userData = {}) => {
    if (!args.length) {
      return "Please specify a username to unban.";
    }
    
    if (!userData.isOwner && !userData.isAdmin) {
      return "You don't have permission to use this command.";
    }
    
    const targetUser = args[0];
    
    // In a real implementation, this would interact with a database
    return `User ${targetUser} has been unbanned.`;
  };

  // Owner command to display owners
  const ownerCommand = () => {
    const owners = gameData.owners || ["Ash", "Misty", "Brock"];
    return `👑 Game Owners: ${owners.join(", ")}`;
  };

  // Mods command to display moderators
  const modsCommand = () => {
    const mods = gameData.mods || ["Gary", "Professor Oak"];
    return `🛡️ Game Moderators: ${mods.join(", ")}`;
  };

  // Buyball command for purchasing specific pokeballs
  const buyballCommand = (args) => {
    if (!args.length) {
      return "Please specify a type of ball to buy (pokeball, greatball, ultraball, masterball).";
    }
    
    const ballType = args[0].toLowerCase();
    const quantity = parseInt(args[1]) || 1;
    
    const prices = {
      pokeball: 100,
      greatball: 250,
      ultraball: 500,
      masterball: 1000
    };
    
    if (!prices[ballType]) {
      return `Invalid ball type. Available types: ${Object.keys(prices).join(", ")}`;
    }
    
    const totalCost = prices[ballType] * quantity;
    
    if (gameData.wallet < totalCost) {
      return `You don't have enough coins. Cost: ${totalCost} coins for ${quantity} ${ballType}(s).`;
    }
    
    setGameData(prev => ({
      ...prev,
      wallet: prev.wallet - totalCost,
      inventory: {
        ...prev.inventory,
        [ballType]: (prev.inventory[ballType] || 0) + quantity
      }
    }));
    
    return `You bought ${quantity} ${ballType}(s) for ${totalCost} coins.`;
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
    
    setGameData(prev => {
      const newParty = [...prev.party];
      const released = newParty.splice(position, 1)[0];
      return {
        ...prev,
        party: newParty,
        wallet: prev.wallet + 50 // Small compensation for releasing
      };
    });
    
    return `You released your Pokemon and received 50 coins as compensation.`;
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
    save: saveCommand,
    load: loadCommand,
    broadcast: broadcastCommand,
    ban: banCommand,
    unban: unbanCommand,
    owner: ownerCommand,
    mods: modsCommand,
    buyball: buyballCommand,
    move: moveCommand,
    release: releaseCommand
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
  const lowerUsername = username.toLowerCase();
  return owners.some(owner => owner.toLowerCase() === lowerUsername) || 
         admins.some(admin => admin.toLowerCase() === lowerUsername);
};

// Helper function to check if a user is an owner
export const isOwnerUser = (username, owners = []) => {
  const lowerUsername = username.toLowerCase();
  return owners.some(owner => owner.toLowerCase() === lowerUsername);
};
