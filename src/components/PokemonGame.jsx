
import React, { useState, useEffect, useRef } from 'react';
import { createCommandSystem, formatCommandOutput } from '../utils/gameCommands';

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
        addToHistory('System', 'Loaded saved game data.');
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

    // Check if the command exists in our command system
    if (commandSystemRef.current && commandSystemRef.current[commandName]) {
      const response = commandSystemRef.current[commandName](args);
      addToHistory('System', response);
    } else if (commandName === 'help') {
      addToHistory('System', `📖 Available Commands:
🧰 General: /help, /ping, /pc, /mods, /owner
🎮 Pokémon: /party, /catch, /spawn, /move, /t2pc, /t2party, /release
🛒 Economy: /wallet, /bank [deposit/withdraw/interest] [amount], /slot, /daily, /shop, /buy [item]
⚔️ Battle: /rb, /battle, /accept, /decline
📦 Storage: /save, /load
🛍️ Shop: /shop, /buyball, /pokemart, /buypokemon
👥 Social: /trade, /accepttrade, /broadcast
👑 Staff: /ban, /unban (owner only)
✨ Other: /mods, /owner, /inventory`);
    } else {
      // Handle the previous command implementations
      handleLegacyCommands(commandName, args);
    }

    // Clear the input
    setInputCommand('');
  };

  // Handle previous command implementations
  const handleLegacyCommands = (commandName, args) => {
    if (commandName === 'spawn' || commandName === 'spawnpokemon') {
      spawnRandomPokemon();
    } else if (commandName === 'catch') {
      catchPokemon(args[0]);
    } else if (commandName === 'party') {
      showParty();
    } else if (commandName === 'rb' || commandName === 'battle') {
      randomBattle();
    } else if (commandName === 't2pc') {
      transferToPC(parseInt(args[0]));
    } else if (commandName === 't2party') {
      transferToParty(parseInt(args[0]));
    } else if (commandName === 'pc') {
      showPC();
    } else {
      addToHistory('System', `Unknown command: ${commandName}. Type /help for a list of commands.`);
    }
  };

  // Spawn a random Pokemon
  const spawnRandomPokemon = async () => {
    try {
      const randomId = Math.floor(Math.random() * 151) + 1;
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
      const pokemon = await response.json();
      
      const poke = {
        name: pokemon.name,
        image: pokemon.sprites.other["official-artwork"].front_default,
        level: 1,
        xp: 0,
        moves: [],
      };
      
      setGameData(prev => ({
        ...prev,
        lastSpawn: poke
      }));
      
      addToHistory('System', `A wild ${poke.name} appeared!`, poke.image);
    } catch (error) {
      addToHistory('System', 'Error fetching Pokemon data.');
    }
  };

  // Catch Pokemon
  const catchPokemon = (ballType = 'pokeball') => {
    if (!gameData.lastSpawn) {
      addToHistory('System', 'No Pokémon to catch!');
      return;
    }
    
    const ball = ballType.toLowerCase();
    const catchRates = {
      pokeball: 0.5,
      greatball: 0.7,
      ultraball: 0.9,
      masterball: 1
    };
    
    if (!gameData.inventory[ball] || gameData.inventory[ball] <= 0) {
      addToHistory('System', `You don't have any ${ball}s!`);
      return;
    }
    
    setGameData(prev => {
      const updated = { ...prev };
      updated.inventory[ball]--;
      
      const chance = Math.random();
      if (chance < catchRates[ball]) {
        if (updated.party.length < 6) {
          updated.party.push(updated.lastSpawn);
          addToHistory('System', `You caught ${updated.lastSpawn.name} and added to your party!`);
        } else {
          updated.pc.push(updated.lastSpawn);
          addToHistory('System', `Party full! ${updated.lastSpawn.name} sent to PC.`);
        }
      } else {
        addToHistory('System', `${updated.lastSpawn.name} escaped!`);
      }
      
      updated.lastSpawn = null;
      return updated;
    });
  };

  // Show party
  const showParty = () => {
    if (gameData.party.length === 0) {
      addToHistory('System', 'Your party is empty!');
      return;
    }
    
    const partyInfo = gameData.party.map((pokemon, index) => 
      `${index}: ${pokemon.name} (Level ${pokemon.level})`
    ).join('\n');
    
    addToHistory('System', `Your party:\n${partyInfo}`);
  };

  // Show PC
  const showPC = () => {
    if (!gameData.pc || gameData.pc.length === 0) {
      addToHistory('System', 'Your PC is empty.');
      return;
    }
    
    const pcInfo = gameData.pc.map((pokemon, index) => 
      `${index}: ${pokemon.name} (Level ${pokemon.level})`
    ).join('\n');
    
    addToHistory('System', `Your PC:\n${pcInfo}`);
  };

  // Transfer to PC
  const transferToPC = (index) => {
    if (isNaN(index) || index < 0 || index >= gameData.party.length) {
      addToHistory('System', 'Invalid party index.');
      return;
    }
    
    setGameData(prev => {
      const updated = { ...prev };
      const pokemon = updated.party.splice(index, 1)[0];
      updated.pc.push(pokemon);
      return updated;
    });
    
    addToHistory('System', `Transferred Pokémon to PC.`);
  };

  // Transfer to Party
  const transferToParty = (index) => {
    if (isNaN(index) || index < 0 || index >= gameData.pc.length) {
      addToHistory('System', 'Invalid PC index.');
      return;
    }
    
    if (gameData.party.length >= 6) {
      addToHistory('System', 'Your party is full! (Max: 6 Pokémon)');
      return;
    }
    
    setGameData(prev => {
      const updated = { ...prev };
      const pokemon = updated.pc.splice(index, 1)[0];
      updated.party.push(pokemon);
      return updated;
    });
    
    addToHistory('System', `Transferred Pokémon to party.`);
  };

  // Random battle
  const randomBattle = () => {
    if (gameData.party.length === 0) {
      addToHistory('System', 'You need Pokémon in your party to battle!');
      return;
    }
    
    const wildLevel = Math.floor(Math.random() * 5) + 1;
    const playerPokemon = gameData.party[0];
    const result = Math.random() < 0.6; // 60% chance to win
    
    if (result) {
      setGameData(prev => ({
        ...prev,
        wallet: prev.wallet + 100,
        party: prev.party.map((pokemon, index) => 
          index === 0 
            ? { ...pokemon, xp: pokemon.xp + 20, level: pokemon.level + (pokemon.xp + 20 >= pokemon.level * 10 ? 1 : 0) } 
            : pokemon
        )
      }));
      
      addToHistory('System', `${playerPokemon.name} won the battle! +100 coins, +20 XP`);
    } else {
      addToHistory('System', `${playerPokemon.name} lost the battle.`);
    }
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
          <li>Pokéballs: {gameData.inventory.pokeball || 0}</li>
          <li>Great Balls: {gameData.inventory.greatball || 0}</li>
          <li>Ultra Balls: {gameData.inventory.ultraball || 0}</li>
          <li>Master Balls: {gameData.inventory.masterball || 0}</li>
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
