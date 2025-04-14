import React, { useState, useEffect } from 'react';

// Pokemon game component with all enhanced commands
const PokemonGame = () => {
  const [gameData, setGameData] = useState({
    inventory: { pokeball: 3, greatball: 1, ultraball: 0, masterball: 0 },
    wallet: 500,
    bank: 0,
    party: [],
    pc: [],
    lastSpawn: null,
    lastDailyClaim: null,
    lastBonusClaim: null,
    lastSpinTime: null,
    experience: 0,
    level: 1,
    bankInterest: 0.05, // 5% interest rate
    slotMachine: {
      symbols: ['🍒', '💎', '7️⃣', '🎰', '⭐'],
      lastPlay: null,
      jackpot: 1000,
    },
  });

  // Enhanced slot machine command
  const playSlot = () => {
    const betAmount = 50; // Fixed bet amount
    if (gameData.wallet < betAmount) {
      return "You need at least 50 coins to play slots!";
    }

    // Cooldown check (1 minute)
    const now = Date.now();
    if (gameData.lastSpinTime && now - gameData.lastSpinTime < 60000) {
      return "Please wait a minute between spins!";
    }

    const reels = [];
    for (let i = 0; i < 3; i++) {
      const randomIndex = Math.floor(Math.random() * gameData.slotMachine.symbols.length);
      reels.push(gameData.slotMachine.symbols[randomIndex]);
    }

    let winAmount = 0;
    const allMatch = reels.every(symbol => symbol === reels[0]);
    const twoMatch = reels[0] === reels[1] || reels[1] === reels[2] || reels[0] === reels[2];

    if (allMatch) {
      if (reels[0] === '💎') {
        winAmount = gameData.slotMachine.jackpot;
      } else {
        winAmount = betAmount * 10;
      }
    } else if (twoMatch) {
      winAmount = betAmount * 2;
    }

    setGameData(prev => ({
      ...prev,
      wallet: prev.wallet - betAmount + winAmount,
      lastSpinTime: now,
      slotMachine: {
        ...prev.slotMachine,
        jackpot: allMatch && reels[0] === '💎' ? 1000 : prev.slotMachine.jackpot + Math.floor(betAmount * 0.1),
      },
    }));

    return `🎰 ${reels.join(' ')} ${winAmount > 0 ? `\nYou won ${winAmount} coins!` : '\nTry again!'}`;
  };

  // Enhanced bank system
  const bankCommands = {
    balance: () => `Bank Balance: ${gameData.bank} coins\nCurrent Interest Rate: ${gameData.bankInterest * 100}%`,
    
    deposit: (amount) => {
      amount = parseInt(amount);
      if (isNaN(amount) || amount <= 0) return "Please specify a valid amount.";
      if (amount > gameData.wallet) return "Insufficient funds in wallet.";
      
      setGameData(prev => ({
        ...prev,
        wallet: prev.wallet - amount,
        bank: prev.bank + amount
      }));
      
      return `Successfully deposited ${amount} coins.`;
    },
    
    withdraw: (amount) => {
      amount = parseInt(amount);
      if (isNaN(amount) || amount <= 0) return "Please specify a valid amount.";
      if (amount > gameData.bank) return "Insufficient funds in bank.";
      
      setGameData(prev => ({
        ...prev,
        bank: prev.bank - amount,
        wallet: prev.wallet + amount
      }));
      
      return `Successfully withdrew ${amount} coins.`;
    },
    
    interest: () => {
      const now = Date.now();
      const lastInterest = gameData.lastInterestClaim || 0;
      const oneDay = 24 * 60 * 60 * 1000;
      
      if (now - lastInterest < oneDay) {
        const timeLeft = oneDay - (now - lastInterest);
        const hoursLeft = Math.floor(timeLeft / (60 * 60 * 1000));
        return `Interest can be claimed in ${hoursLeft} hours.`;
      }
      
      const interestAmount = Math.floor(gameData.bank * gameData.bankInterest);
      setGameData(prev => ({
        ...prev,
        bank: prev.bank + interestAmount,
        lastInterestClaim: now
      }));
      
      return `You earned ${interestAmount} coins in interest!`;
    }
  };

  // Command handler
  const handleCommand = (command, args) => {
    switch (command) {
      case '/slot':
        return playSlot();
      case '/bank':
        if (!args.length) return bankCommands.balance();
        const [subCommand, ...subArgs] = args;
        return bankCommands[subCommand]?.(subArgs[0]) || "Invalid bank command. Try balance/deposit/withdraw/interest";
      // ... other command handlers
      default:
        return "Unknown command. Use /help to see available commands.";
    }
  };

  // Effect for auto-saving game data
  useEffect(() => {
    const saveInterval = setInterval(() => {
      localStorage.setItem('pokemonGameData', JSON.stringify(gameData));
    }, 60000); // Auto-save every minute

    return () => clearInterval(saveInterval);
  }, [gameData]);

  // Load saved data on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('pokemonGameData');
    if (savedData) {
      setGameData(JSON.parse(savedData));
    }
  }, []);

  return (
    <div className="pokemon-game">
      <div className="game-header">
        <h1>Pokémon RPG</h1>
        <div className="player-stats">
          <div className="wallet">Wallet: {gameData.wallet} coins</div>
          <div className="bank">Bank: {gameData.bank} coins</div>
        </div>
      </div>
      
      <div className="game-content">
        <div className="command-history">
          {/* Command history would be displayed here */}
        </div>
        
        <div className="command-input">
          <input 
            type="text" 
            placeholder="Enter command (e.g., /help, /slot, /bank)" 
            // Input handling would go here
          />
          <button>Send</button>
        </div>
      </div>
      
      <div className="game-inventory">
        <h3>Inventory</h3>
        <ul>
          <li>Pokéballs: {gameData.inventory.pokeball}</li>
          <li>Great Balls: {gameData.inventory.greatball}</li>
          <li>Ultra Balls: {gameData.inventory.ultraball}</li>
          <li>Master Balls: {gameData.inventory.masterball}</li>
        </ul>
      </div>
      
      <div className="game-party">
        <h3>Pokémon Party</h3>
        {gameData.party.length === 0 ? (
          <p>No Pokémon in your party yet!</p>
        ) : (
          <ul>
            {gameData.party.map((pokemon, index) => (
              <li key={index}>
                {pokemon.name} (Level {pokemon.level})
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default PokemonGame;
