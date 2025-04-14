
import React, { useState, useEffect, useRef } from 'react';
import { createCommandSystem } from '../utils/gameCommands';

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
    lastSlotPlay: null,
    lastInterestClaim: null,
    experience: 0,
    level: 1,
    bankInterest: 0.05, // 5% interest rate
    slotMachine: {
      symbols: ['🍒', '💎', '7️⃣', '🎰', '⭐'],
      jackpot: 1000,
    },
  });

  const [commandHistory, setCommandHistory] = useState([]);
  const [inputCommand, setInputCommand] = useState('');
  const commandSystemRef = useRef(null);
  const commandHistoryRef = useRef(null);

  // Initialize command system
  useEffect(() => {
    commandSystemRef.current = createCommandSystem(gameData, setGameData);
  }, [gameData]);

  // Load saved data on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('pokemonGameData');
    if (savedData) {
      try {
        setGameData(JSON.parse(savedData));
      } catch (error) {
        console.error('Error loading saved data:', error);
        addToHistory('System', 'Error loading saved game data.');
      }
    }
  }, []);

  // Auto-save game data
  useEffect(() => {
    const saveInterval = setInterval(() => {
      localStorage.setItem('pokemonGameData', JSON.stringify(gameData));
    }, 60000); // Auto-save every minute

    return () => clearInterval(saveInterval);
  }, [gameData]);

  // Scroll to bottom when command history updates
  useEffect(() => {
    if (commandHistoryRef.current) {
      commandHistoryRef.current.scrollTop = commandHistoryRef.current.scrollHeight;
    }
  }, [commandHistory]);

  // Add message to command history
  const addToHistory = (sender, message) => {
    setCommandHistory(prev => [...prev, { sender, message, timestamp: new Date() }]);
  };

  // Handle command input
  const handleCommandInput = (e) => {
    setInputCommand(e.target.value);
  };

  // Process command
  const processCommand = () => {
    if (!inputCommand.trim()) return;

    // Add the command to history
    addToHistory('You', inputCommand);

    // Process the command
    const commandParts = inputCommand.split(' ');
    const commandName = commandParts[0].toLowerCase().replace('/', '');
    const args = commandParts.slice(1);

    if (commandName === 'slot') {
      const response = commandSystemRef.current.slot();
      addToHistory('System', response);
    } else if (commandName === 'bank') {
      const response = commandSystemRef.current.bank(args);
      addToHistory('System', response);
    } else if (commandName === 'help') {
      addToHistory('System', `📖 Available Commands:
🧰 General: /help, /ping, /pc, /mods, /owner
🎮 Pokémon: /party, /catch, /spawn, /move, /t2pc, /t2party, /release
🛒 Economy: /wallet, /bank [deposit/withdraw/interest] [amount], /slot, /daily
⚔️ Battle: /rb, /battle, /accept, /decline
📦 Storage: /save, /load
🛍️ Shop: /shop, /buyball, /pokemart, /buypokemon
👥 Social: /trade, /accepttrade, /broadcast
👑 Staff: /ban, /unban (owner only)
✨ Other: /mods, /owner`);
    } else if (commandName === 'save') {
      localStorage.setItem('pokemonGameData', JSON.stringify(gameData));
      addToHistory('System', 'Game saved successfully!');
    } else if (commandName === 'load') {
      const savedData = localStorage.getItem('pokemonGameData');
      if (savedData) {
        try {
          setGameData(JSON.parse(savedData));
          addToHistory('System', 'Game loaded successfully!');
        } catch (error) {
          addToHistory('System', 'Error loading saved game.');
        }
      } else {
        addToHistory('System', 'No saved game found.');
      }
    } else if (commandName === 'wallet') {
      addToHistory('System', `Wallet: ${gameData.wallet} coins\nBank: ${gameData.bank} coins`);
    } else {
      addToHistory('System', `Unknown command: ${commandName}. Type /help for a list of commands.`);
    }

    // Clear the input
    setInputCommand('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      processCommand();
    }
  };

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
        <div 
          className="command-history"
          ref={commandHistoryRef}
        >
          {commandHistory.map((entry, index) => (
            <div key={index} className={`history-entry ${entry.sender === 'You' ? 'player-command' : 'system-response'}`}>
              <span className="sender">{entry.sender}:</span> {entry.message}
            </div>
          ))}
        </div>
        
        <div className="command-input">
          <input 
            type="text" 
            value={inputCommand}
            onChange={handleCommandInput}
            onKeyPress={handleKeyPress}
            placeholder="Enter command (e.g., /help, /slot, /bank)" 
          />
          <button onClick={processCommand}>Send</button>
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
