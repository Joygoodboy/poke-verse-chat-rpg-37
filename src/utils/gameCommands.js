
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

    return `🎰 | ${result.join(' | ')} | ${multiplier > 0 ? `\nYou won ${winAmount} coins!` : '\nBetter luck next time!'}`;
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

  // Object with all commands
  const commands = {
    slot: slotCommand,
    bank: bankCommand
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
