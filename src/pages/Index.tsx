
import { useEffect, useState, useRef } from "react";
import { db } from "../firebase";
import { ref, onChildAdded, push } from "firebase/database";
const ownerList = ["Ash", "yo"]; // Add usernames of owners here

const PokemonRPG = () => {
  const [username, setUsername] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<any[]>([]);
  const [showLogin, setShowLogin] = useState<boolean>(true);
  const [loginUsername, setLoginUsername] = useState<string>("");
  const chatDivRef = useRef<HTMLDivElement>(null);

  // Player data state
  const [playerData, setPlayerData] = useState({
    inventory: { pokeball: 3, greatball: 1, ultraball: 0, masterball: 0 },
    wallet: 500,
    bank: 0,
    party: [],
    pc: [],
    lastSpawn: null,
    lastDailyClaim: null,
    bonusUsed: false
  });

  const catchRates = {
    pokeball: 0.5,
    greatball: 0.7,
    ultraball: 0.9,
    masterball: 1
  };

  useEffect(() => {
    // Check if user is already logged in
    const storedUsername = localStorage.getItem("loggedInUser");
    if (storedUsername) {
      setUsername(storedUsername);
      setShowLogin(false);
      
      // Load saved game data
      const savedData = localStorage.getItem("pokemonSave");
      if (savedData) {
        try {
          setPlayerData(JSON.parse(savedData));
        } catch (e) {
          console.error("Error loading saved data", e);
        }
      }
    }

    // Set up Firebase listener for chat messages
    const chatRef = ref(db, "chat");
    const unsubscribe = onChildAdded(chatRef, (snapshot) => {
      const message = snapshot.val();
      if (message) {
        setMessages(prev => [...prev, message]);
      }
    });

    // Clean up listener
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (chatDivRef.current) {
      chatDivRef.current.scrollTop = chatDivRef.current.scrollHeight;
    }
  }, [messages]);

  const handleLogin = () => {
    if (loginUsername.trim()) {
      localStorage.setItem("loggedInUser", loginUsername);
      setUsername(loginUsername);
      setShowLogin(false);
    } else {
      alert("Please enter a username");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    setUsername("");
    setShowLogin(true);
  };

  const broadcast = (text: string, image: string | null = null) => {
    const chatRef = ref(db, "chat");
    push(chatRef, { user: username, text, image });
  };

  const fetchPokemon = async (nameOrId: string | number) => {
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${nameOrId}`);
      return await response.json();
    } catch (error) {
      console.error("Error fetching Pokemon:", error);
      broadcast("Error fetching Pokemon data.");
      return null;
    }
  };

  const gainXP = (pokemon: any, amount: number) => {
    const updatedPlayerData = { ...playerData };
    const targetPokemon = updatedPlayerData.party.find(p => p === pokemon);
    
    if (targetPokemon) {
      targetPokemon.xp += amount;
      const needed = targetPokemon.level * 10;
      
      if (targetPokemon.xp >= needed) {
        targetPokemon.level++;
        targetPokemon.xp = 0;
        broadcast(`${targetPokemon.name} leveled up to ${targetPokemon.level}!`);
        checkEvolution(targetPokemon);
        learnMove(targetPokemon);
      }
      
      setPlayerData(updatedPlayerData);
    }
  };

  const learnMove = (pokemon: any) => {
    const levelMoves: Record<number, string> = {
      5: "tackle", 10: "quick attack", 15: "bite",
      20: "slash", 25: "flamethrower", 30: "hyper beam"
    };
    
    const newMove = levelMoves[pokemon.level];
    if (newMove) {
      if (pokemon.moves.length < 4) {
        pokemon.moves.push(newMove);
        broadcast(`${pokemon.name} learned ${newMove}!`);
      } else {
        const replaced = pokemon.moves.shift();
        pokemon.moves.push(newMove);
        broadcast(`${pokemon.name} forgot ${replaced} and learned ${newMove}!`);
      }
    }
  };

  const checkEvolution = async (pokemon: any) => {
    const evos: Record<string, { level: number, evolveTo: string }> = {
      "bulbasaur": { level: 16, evolveTo: "ivysaur" },
      "ivysaur": { level: 32, evolveTo: "venusaur" },
      "charmander": { level: 16, evolveTo: "charmeleon" },
      "charmeleon": { level: 36, evolveTo: "charizard" },
      "squirtle": { level: 16, evolveTo: "wartortle" },
      "wartortle": { level: 36, evolveTo: "blastoise" }
    };
    
    const evo = evos[pokemon.name.toLowerCase()];
    if (evo && pokemon.level >= evo.level) {
      broadcast(`${pokemon.name} evolved into ${evo.evolveTo}!`);
      pokemon.name = evo.evolveTo;
      
      const data = await fetchPokemon(evo.evolveTo);
      if (data) {
        pokemon.image = data.sprites.other["official-artwork"].front_default;
      }
    }
  };

  const randomBattle = () => {
    if (playerData.party.length === 0) {
      broadcast("You have no Pokémon!");
      return;
    }
    
    const opponent = { level: Math.floor(Math.random() * 10 + 1), hp: 100 };
    const userPoke = playerData.party[0];
    const win = Math.random() < 0.6;
    
    if (win) {
      gainXP(userPoke, opponent.level * 5);
      
      setPlayerData(prev => ({
        ...prev,
        wallet: prev.wallet + 100
      }));
      
      broadcast(`${userPoke.name} won the battle! +XP & coins`);
    } else {
      broadcast(`${userPoke.name} lost the battle.`);
    }
  };

  const handleCommand = async () => {
    if (!message.trim()) return;
    
    broadcast(message);
    
    const args = message.split(" ");
    const base = args[0].toLowerCase();
    
    switch(base) {
      case "/help":
        broadcast(`📖 Available Commands:
🧰 General: /help, /ping, /pc, /mods, /owner
🎮 Pokémon: /party, /catch, /spawn, /move, /t2pc, /t2party, /release
🛒 Economy: /wallet, /bank, /deposit, /withdraw, /slot, /daily
⚔️ Battle: /rb, /battle, /accept, /decline
📦 Storage: /save, /load
🛍️ Shop: /shop, /buyball, /pokemart, /buypokemon
👥 Social: /trade, /accepttrade, /broadcast
👑 Staff: /ban, /unban (owner only)
✨ Other: /mods, /owner`);
        break;
        
      case "/spawnpokemon":
        const randomId = Math.floor(Math.random() * 151) + 1;
        const pokemon = await fetchPokemon(randomId);
        
        if (pokemon) {
          const poke = {
            name: pokemon.name,
            image: pokemon.sprites.other["official-artwork"].front_default,
            level: 1,
            xp: 0,
            moves: [],
          };
          
          setPlayerData(prev => ({
            ...prev,
            lastSpawn: poke
          }));
          
          broadcast(`A wild <b>${poke.name}</b> appeared!`, poke.image);
        }
        break;
        
      case "/pokemart":
        broadcast(`Welcome to the PokéMart! Here are the available Pokémon:<br>
        Rayquaza - 20000 coins<br>
        Melmetal - 30000 coins<br>
        Regigigas - 30000 coins<br>
        Buzzwole - 40000 coins<br>
        Eternatus - 30000 coins<br>
        Regieleki - 30000 coins<br>
        Groudon - 30000 coins<br>
        Aggron - 20000 coins<br>
        Tyranitar - 20000 coins<br>
        Mewtwo - 30000 coins`);
        break;
        
      case "/buypokemon": {
        const pokeName = args[1]?.toLowerCase();
        const mart: Record<string, number> = {
          rayquaza: 20000,
          melmetal: 30000,
          regigigas: 30000,
          buzzwole: 40000,
          eternatus: 30000,
          regieleki: 30000,
          groudon: 30000,
          aggron: 20000,
          tyranitar: 20000,
          mewtwo: 30000
        };
        
        if (!pokeName || !mart[pokeName]) {
          broadcast("❌ Invalid or unavailable Pokémon. Use /pokemart to view available options.");
          break;
        }
        
        const cost = mart[pokeName];
        if (playerData.wallet < cost) {
          broadcast(`💸 Not enough coins! You need ${cost} coins to buy ${pokeName}.`);
          break;
        }
        
        const pokemon = await fetchPokemon(pokeName);
        if (pokemon) {
          const poke = {
            name: pokemon.name,
            image: pokemon.sprites.other["official-artwork"].front_default,
            level: 1,
            xp: 0,
            moves: []
          };
          
          setPlayerData(prev => {
            const updated = { ...prev, wallet: prev.wallet - cost };
            
            if (updated.party.length < 6) {
              updated.party.push(poke);
              broadcast(`✅ You bought ${poke.name} and added it to your party!`, poke.image);
            } else {
              updated.pc.push(poke);
              broadcast(`✅ You bought ${poke.name}, but your party is full. Sent to your PC.`, poke.image);
            }
            
            return updated;
          });
        }
        break;
      }
        
      case "/alive":
        broadcast("Yes, I am online!");
        break;
        
      case "/catch":
        if (!playerData.lastSpawn) {
          broadcast("No Pokémon to catch!");
          break;
        }
        
        const ball = args[1]?.toLowerCase() || "pokeball";
        if (!playerData.inventory[ball] || playerData.inventory[ball] <= 0) {
          broadcast(`You don't have any ${ball}s!`);
          break;
        }
        
        setPlayerData(prev => {
          const updated = { ...prev };
          updated.inventory[ball]--;
          
          const chance = Math.random();
          if (chance < catchRates[ball]) {
            if (updated.party.length < 6) {
              updated.party.push(updated.lastSpawn);
              broadcast(`You caught ${updated.lastSpawn.name} and added to your party!`);
            } else {
              updated.pc.push(updated.lastSpawn);
              broadcast(`Party full! ${updated.lastSpawn.name} sent to PC.`);
            }
          } else {
            broadcast(`${updated.lastSpawn.name} escaped!`);
          }
          
          updated.lastSpawn = null;
          return updated;
        });
        break;
        
      case "/shop":
        broadcast("Poké Ball Prices:<br>pokeball: 100<br>greatball: 250<br>ultraball: 500<br>masterball: 1000");
        break;
        
      case "/buy":
        const item = args[1]?.toLowerCase();
        const prices = { pokeball: 100, greatball: 250, ultraball: 500, masterball: 1000 };
        
        if (!prices[item]) {
          broadcast("Invalid item!");
          break;
        }
        
        if (playerData.wallet >= prices[item]) {
          setPlayerData(prev => ({
            ...prev,
            wallet: prev.wallet - prices[item],
            inventory: {
              ...prev.inventory,
              [item]: (prev.inventory[item] || 0) + 1
            }
          }));
          
          broadcast(`You bought a ${item}.`);
        } else {
          broadcast("Not enough money!");
        }
        break;
        
      case "/inventory":
        const inv = playerData.inventory;
        broadcast(`Inventory:<br>Pokéballs: ${inv.pokeball}<br>Great Balls: ${inv.greatball}<br>Ultra Balls: ${inv.ultraball}<br>Master Balls: ${inv.masterball}`);
        break;
        
      case "/wallet":
        broadcast(`Wallet: ${playerData.wallet}<br>Bank: ${playerData.bank}`);
        break;
        
      case "/daily":
        const now = Date.now();
        const diff = now - (playerData.lastDailyClaim || 0);
        const oneDay = 24 * 60 * 60 * 1000;
        
        if (diff >= oneDay) {
          const reward = 500;
          
          setPlayerData(prev => ({
            ...prev,
            wallet: prev.wallet + reward,
            lastDailyClaim: now
          }));
          
          broadcast(`🎁 You claimed your daily reward of ${reward} coins!`);
        } else {
          const remaining = oneDay - diff;
          const hrs = Math.floor(remaining / (1000 * 60 * 60));
          const mins = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
          broadcast(`⏳ You already claimed your daily reward. Come back in ${hrs}h ${mins}m.`);
        }
        break;
        
      case "/ping":
        const start = Date.now();
        broadcast("🏓 Pinging...");
        setTimeout(() => {
          const latency = Date.now() - start;
          broadcast(`🏓 Pong! Latency is ${latency}ms.`);
        }, 0);
        break;
        
      case "/bonus":
        if (playerData.bonusUsed) {
          broadcast("You have already claimed your bonus.");
        } else {
          setPlayerData(prev => {
            const updated = {
              ...prev,
              wallet: prev.wallet + 20000,
              bonusUsed: true
            };
            
            if (updated.party.length > 0) {
              gainXP(updated.party[0], 30);
            }
            
            return updated;
          });
          
          broadcast("You received a 20,000 coin bonus and 30 XP!");
        }
        break;
        
      case "/t2pc":
        const index = parseInt(args[1]);
        
        if (isNaN(index) || index < 0 || index >= playerData.party.length) {
          broadcast("❌ Invalid party index.");
        } else {
          setPlayerData(prev => {
            const updated = { ...prev };
            const removed = updated.party.splice(index, 1)[0];
            updated.pc.push(removed);
            broadcast(`${removed.name} was sent to the PC.`);
            
            // Give XP to first Pokémon in party if any remain
            if (updated.party.length > 0) {
              gainXP(updated.party[0], 10);
            }
            
            return updated;
          });
        }
        break;
        
      case "/t2party":
        const pcIndex = parseInt(args[1]);
        
        if (isNaN(pcIndex) || pcIndex < 0 || pcIndex >= playerData.pc.length) {
          broadcast("❌ Invalid PC index.");
        } else if (playerData.party.length >= 6) {
          broadcast("⚠️ Your party is already full (max 6 Pokémon).");
        } else {
          setPlayerData(prev => {
            const updated = { ...prev };
            const movedPoke = updated.pc.splice(pcIndex, 1)[0];
            updated.party.push(movedPoke);
            broadcast(`✅ ${movedPoke.name} was moved to your party.`);
            gainXP(movedPoke, 10);
            
            return updated;
          });
        }
        break;
        
      case "/owner":
        if (ownerList.length === 0) {
          broadcast("❌ No owners are currently set.");
        } else {
          broadcast(`👑 Owner${ownerList.length > 1 ? 's' : ''}: ${ownerList.join(", ")}`);
        }
        break;
        
      case "/pc":
        if (!playerData.pc || playerData.pc.length === 0) {
          broadcast("📦 Your PC is empty.");
        } else {
          const pcList = playerData.pc.map((poke, i) => `${i}. ${poke.name} (Lv. ${poke.level})`).join("\n");
          broadcast(`📦 Your PC Pokémon:\n${pcList}`);
        }
        break;
        
      case "/deposit":
        const dep = parseInt(args[1]);
        
        if (!isNaN(dep) && playerData.wallet >= dep) {
          setPlayerData(prev => ({
            ...prev,
            wallet: prev.wallet - dep,
            bank: prev.bank + dep
          }));
          
          broadcast(`Deposited ${dep} coins.`);
        } else {
          broadcast("Invalid amount.");
        }
        break;
        
      case "/withdraw":
        const wit = parseInt(args[1]);
        
        if (!isNaN(wit) && playerData.bank >= wit) {
          setPlayerData(prev => ({
            ...prev,
            bank: prev.bank - wit,
            wallet: prev.wallet + wit
          }));
          
          broadcast(`Withdrew ${wit} coins.`);
        } else {
          broadcast("Invalid amount.");
        }
        break;
        
      case "/slot":
        if (playerData.wallet <= 0) {
          broadcast("💸 You have no coins to play!");
        } else {
          const outcome = Math.random();
          
          if (outcome < 0.69) {
            setPlayerData(prev => ({
              ...prev,
              wallet: prev.wallet * 2
            }));
            
            broadcast("🎉 You WON! Wallet doubled!");
          } else {
            setPlayerData(prev => ({
              ...prev,
              wallet: 0
            }));
            
            broadcast("💸 You lost everything in slots!");
          }
        }
        break;
        
      case "/save":
        localStorage.setItem("pokemonSave", JSON.stringify(playerData));
        broadcast("Game saved locally!");
        break;
        
      case "/rb":
        randomBattle();
        break;
        
      case "/battle":
        if (window.confirm("Battle a random trainer?")) randomBattle();
        break;
        
      case "/party":
        const info = playerData.party.map(p => `${p.name} (Lv. ${p.level}) - Moves: ${p.moves.join(", ") || "None"}`).join("<br>");
        broadcast(`Your Party:<br>${info}`);
        break;
    }
    
    setMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleCommand();
    }
  };

  if (showLogin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-2xl font-bold mb-6 text-center">Login to Pokémon RPG</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                id="username"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                placeholder="Enter your trainer name"
              />
            </div>
            <button
              onClick={handleLogin}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition"
            >
              Start Adventure
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="bg-blue-500 text-white p-3 flex justify-between items-center">
        <h1 className="text-xl font-bold">Pokémon RPG</h1>
        <div className="flex items-center">
          <span className="mr-4">Trainer: {username}</span>
          <button 
            onClick={handleLogout} 
            className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded"
          >
            Logout
          </button>
        </div>
      </div>
      
      <div 
        id="chat" 
        ref={chatDivRef} 
        className="flex-1 overflow-y-auto p-4 bg-gray-100"
      >
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`max-w-[80%] my-2 p-3 rounded-lg clear-both ${
              msg.user === username 
                ? "bg-green-100 float-right text-right" 
                : "bg-white float-left text-left"
            }`}
          >
            <div><strong>{msg.user}:</strong> <span dangerouslySetInnerHTML={{ __html: msg.text }} /></div>
            {msg.image && <img src={msg.image} alt="Pokemon" className="max-w-[100px] mt-2" />}
          </div>
        ))}
      </div>
      
      <div id="input" className="flex p-3 bg-gray-200 border-t border-gray-300">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter command..."
          className="flex-1 p-2 rounded-l-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleCommand}
          className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default PokemonRPG;
