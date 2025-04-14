
// Command utilities for the Pokemon game
export const createCommandSystem = (gameData, setGameData) => {
  const commands = {
    // Enhanced slot command
    slot: () => {
      const betAmount = 50;
      if (gameData.wallet < betAmount) {
        return "Insufficient funds for slots!";
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
    },

    // Bank system commands
    bank: (args) => {
      if (!args.length) {
        return `Bank Balance: ${gameData.bank}\nWallet: ${gameData.wallet}`;
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
          const interestRate = 0.05; // 5% daily interest
          const interestAmount = Math.floor(gameData.bank * interestRate);
          setGameData(prev => ({
            ...prev,
            bank: prev.bank + interestAmount
          }));
          return `You earned ${interestAmount} coins in interest!`;

        default:
          return "Invalid bank command. Use: /bank [deposit/withdraw/interest] [amount]";
      }
    },
  };

  return commands;
};
