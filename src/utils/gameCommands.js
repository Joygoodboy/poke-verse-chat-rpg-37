
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
    load: loadCommand
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
