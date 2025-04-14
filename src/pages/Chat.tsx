
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ChevronLeft, Send, Award, User, Wallet, Bank, Package, Gamepad, Gift, HelpCircle } from "lucide-react";
import { db } from "../firebase";
import { ref, onChildAdded, push } from "firebase/database";

const Chat = () => {
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<any[]>([]);
  const [username, setUsername] = useState<string>("");
  const [playerData, setPlayerData] = useState({
    inventory: { pokeball: 5, greatball: 0, ultraball: 0, masterball: 0 },
    wallet: 500,
    bank: 0,
    party: [],
    pc: [],
    lastSpawn: null,
    lastDailyClaim: null,
    xp: 0,
    level: 1,
    bonusUsed: false
  });
  
  const chatDivRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  const catchRates = {
    pokeball: 0.5,
    greatball: 0.7,
    ultraball: 0.9,
    masterball: 1
  };

  useEffect(() => {
    // Check if user is logged in
    const storedUsername = localStorage.getItem("loggedInUser");
    if (!storedUsername) {
      navigate("/login");
      return;
    }
    setUsername(storedUsername);
    
    // Load saved game data
    const savedData = localStorage.getItem("pokemonSave");
    if (savedData) {
      try {
        setPlayerData(JSON.parse(savedData));
      } catch (e) {
        console.error("Error loading saved data", e);
      }
    }

    // Set up Firebase listener for chat messages
    const chatRef = ref(db, "chat");
    const unsubscribe = onChildAdded(chatRef, (snapshot) => {
      const message = snapshot.val();
      setMessages(prev => [...prev, message]);
    });

    // Clean up listener on unmount
    return () => {
      // Firebase v9 doesn't use off() anymore
      // The returned function from onChildAdded is the unsubscribe function
      unsubscribe();
    };
  }, [navigate]);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (chatDivRef.current) {
      chatDivRef.current.scrollTop = chatDivRef.current.scrollHeight;
    }
  }, [messages]);

  const broadcast = (text: string, image: string | null = null) => {
    const chatRef = ref(db, "chat");
    push(chatRef, { user: username, text, image });
  };

  const handleCommand = async () => {
    if (!message.trim()) return;
    
    broadcast(message);
    
    const args = message.split(" ");
    const base = args[0].toLowerCase();
    
    switch (base) {
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
✨ Other: /mods, /owner, /rank`);
        break;
        
      case "/spawnpokemon":
      case "/spawn":
        const randomId = Math.floor(Math.random() * 151) + 1;
        try {
          const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
          const pokemon = await response.json();
          
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
        } catch (error) {
          console.error("Error fetching Pokemon:", error);
          broadcast("Error fetching Pokemon data.");
        }
        break;

      case "/rank":
        if (!playerData.xp) playerData.xp = 0;
        if (!playerData.level) playerData.level = 1;
        if (!playerData.wallet) playerData.wallet = 0;

        let level = playerData.level;
        let xp = playerData.xp;
        let nextLevelXP = 750 * Math.pow(2, level - 1);

        function getTitle(level: number) {
          if (level >= 50) return "Legendary Master";
          if (level >= 40) return "Dragon Slayer";
          if (level >= 35) return "Champion";
          if (level >= 30) return "Elite Warrior";
          if (level >= 25) return "Knight";
          if (level >= 20) return "Paladin";
          if (level >= 15) return "Warrior";
          if (level >= 10) return "Fighter";
          if (level >= 5) return "Apprentice";
          return "Novice";
        }

        const updatedPlayerData = { ...playerData };
        let leveledUp = false;

        while (xp >= nextLevelXP) {
          xp -= nextLevelXP;
          level++;
          leveledUp = true;
          let reward = Math.floor(5000 * Math.pow(1.5, level - 2));
          updatedPlayerData.wallet += reward;
          broadcast(`🎉 You leveled up to Lv. ${level} (${getTitle(level)})! Earned 💰 ${reward} coins!`);
          nextLevelXP = 750 * Math.pow(2, level - 1);
        }

        updatedPlayerData.level = level;
        updatedPlayerData.xp = xp;

        if (leveledUp) {
          setPlayerData(updatedPlayerData);
        }

        const percent = Math.floor((xp / nextLevelXP) * 100);
        const filled = Math.floor(percent / 10);
        const bar = `[${"■".repeat(filled)}${"□".repeat(10 - filled)}] ${xp}/${nextLevelXP}`;

        const title = getTitle(level);
        const imageUrl = `https://robohash.org/${encodeURIComponent(title)}.png?set=set2`; // fantasy monster-style

        broadcast(
          `📊 Your Rank:<br>` +
          `<img src="${imageUrl}" width="80" height="80"><br>` +
          `🧱 Level: ${level}<br>` +
          `🏷️ Title: ${title}<br>` +
          `📈 XP: ${xp}/${nextLevelXP} (${percent}%)<br>` +
          `${bar}`
        );
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
              
              // Add XP for catching a Pokemon
              updated.xp += 50;
            } else {
              updated.pc.push(updated.lastSpawn);
              broadcast(`Party full! ${updated.lastSpawn.name} sent to PC.`);
              
              // Add XP for catching a Pokemon
              updated.xp += 25;
            }
          } else {
            broadcast(`${updated.lastSpawn.name} escaped!`);
          }
          
          updated.lastSpawn = null;
          return updated;
        });
        break;
        
      case "/party":
        if (playerData.party.length === 0) {
          broadcast("⚠️ You don't have any Pokémon in your party yet. Use /spawn and /catch to get started!");
        } else {
          const info = playerData.party.map((p, idx) => 
            `${idx}. ${p.name} (Lv. ${p.level}) - Moves: ${p.moves.join(", ") || "None"}`
          ).join("<br>");
          broadcast(`Your Party:<br>${info}`);
        }
        break;
        
      case "/inventory":
        const inv = playerData.inventory;
        broadcast(`<b>Your Inventory:</b><br>• Pokéball: ${inv.pokeball}<br>• Greatball: ${inv.greatball}<br>• Ultraball: ${inv.ultraball}<br>• Masterball: ${inv.masterball}`);
        break;
        
      case "/wallet":
        broadcast(`<b>Wallet:</b> ${playerData.wallet}<br><b>Bank:</b> ${playerData.bank}`);
        break;
        
      case "/save":
        localStorage.setItem("pokemonSave", JSON.stringify(playerData));
        broadcast("✅ Game saved locally!");
        break;
        
      case "/daily":
        const now = Date.now();
        const diff = now - (playerData.lastDailyClaim || 0);
        const oneDay = 24 * 60 * 60 * 1000;
        
        if (diff >= oneDay) {
          const reward = 500;
          const xpReward = 100;
          
          setPlayerData(prev => ({
            ...prev,
            wallet: prev.wallet + reward,
            xp: prev.xp + xpReward,
            lastDailyClaim: now
          }));
          
          broadcast(`🎁 You claimed your daily reward of ${reward} coins and ${xpReward} XP!`);
        } else {
          const remaining = oneDay - diff;
          const hrs = Math.floor(remaining / (1000 * 60 * 60));
          const mins = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
          broadcast(`⏳ You already claimed your daily reward. Come back in ${hrs}h ${mins}m.`);
        }
        break;
      
      default:
        // Command not recognized, broadcast as regular message
        break;
    }
    
    setMessage("");
  };

  const handleCommandButton = (cmd: string) => {
    setMessage(cmd);
    // Execute command immediately
    setTimeout(() => {
      handleCommand();
    }, 10);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleCommand();
    }
  };
  
  const goToHome = () => {
    navigate("/");
  };

  return (
    <div className="flex h-screen bg-blue-500">
      {/* Left sidebar - Online Trainers */}
      <div className="hidden md:block w-64 bg-blue-200/30 backdrop-blur-sm p-4 border-r border-blue-300">
        <h2 className="text-white font-bold mb-4 flex items-center">
          <User className="mr-2" size={18} /> Online Trainers
          <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">0 online</span>
        </h2>
        <div className="text-white/70 italic">
          No trainers online
        </div>
      </div>
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden">
        <div className="bg-blue-600 p-3 text-white flex items-center">
          <Button 
            variant="ghost" 
            className="text-white mr-2 p-1"
            onClick={goToHome}
          >
            <ChevronLeft size={20} />
          </Button>
          <h1 className="text-xl font-bold">Pokémon RPG Chat</h1>
        </div>
        
        <div 
          ref={chatDivRef}
          className="flex-1 overflow-y-auto p-4 bg-white/10 backdrop-blur-sm"
        >
          {messages.map((msg, index) => (
            <div 
              key={index} 
              className={`max-w-[80%] my-2 p-3 rounded-lg clear-both ${
                msg.user === username 
                  ? "bg-blue-500/80 text-white float-right text-right" 
                  : msg.user === "System"
                    ? "bg-purple-500/80 text-white mx-auto clear-both text-center"
                    : "bg-white/80 float-left text-left"
              }`}
            >
              <div><strong>{msg.user}:</strong> <span dangerouslySetInnerHTML={{ __html: msg.text }} /></div>
              {msg.image && <img src={msg.image} alt="Pokemon" className="max-w-[100px] mt-2" />}
            </div>
          ))}
        </div>
        
        {/* Command Buttons */}
        <div className="bg-blue-700/50 backdrop-blur-sm px-2 py-1 flex flex-wrap gap-1">
          <Button 
            variant="outline" 
            size="sm"
            className="bg-blue-500/30 text-white border-blue-400 hover:bg-blue-600/50"
            onClick={() => handleCommandButton("/help")}
          >
            <HelpCircle className="mr-1" size={14} /> Help
          </Button>
          <Button 
            variant="outline"
            size="sm"
            className="bg-green-500/30 text-white border-green-400 hover:bg-green-600/50"
            onClick={() => handleCommandButton("/spawn")}
          >
            Spawn
          </Button>
          <Button 
            variant="outline"
            size="sm" 
            className="bg-indigo-500/30 text-white border-indigo-400 hover:bg-indigo-600/50"
            onClick={() => handleCommandButton("/party")}
          >
            Party
          </Button>
          <Button 
            variant="outline"
            size="sm" 
            className="bg-yellow-500/30 text-white border-yellow-400 hover:bg-yellow-600/50"
            onClick={() => handleCommandButton("/rank")}
          >
            <Award className="mr-1" size={14} /> Rank
          </Button>
          <Button 
            variant="outline"
            size="sm" 
            className="bg-red-500/30 text-white border-red-400 hover:bg-red-600/50"
            onClick={() => handleCommandButton("/inventory")}
          >
            Inventory
          </Button>
          <Button 
            variant="outline"
            size="sm" 
            className="bg-purple-500/30 text-white border-purple-400 hover:bg-purple-600/50"
            onClick={() => handleCommandButton("/shop")}
          >
            Shop
          </Button>
          <Button 
            variant="outline"
            size="sm" 
            className="bg-pink-500/30 text-white border-pink-400 hover:bg-pink-600/50"
            onClick={() => handleCommandButton("/daily")}
          >
            <Gift className="mr-1" size={14} /> Daily
          </Button>
        </div>
        
        {/* Input Area */}
        <div className="p-4 bg-blue-800/50 backdrop-blur-sm flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Chat or enter a command (/help)..."
            className="flex-1 bg-white/90"
          />
          <Button 
            className="bg-indigo-500 hover:bg-indigo-600 text-white"
            onClick={handleCommand}
          >
            <Send size={18} />
          </Button>
        </div>
      </div>
      
      {/* Right sidebar - Player Stats - Enhanced to match the image */}
      <div className="hidden md:flex flex-col w-64 bg-blue-200/30 backdrop-blur-sm p-4 border-l border-blue-300 gap-4">
        {/* Player Info Card */}
        <Card className="bg-yellow-100 border-2 border-yellow-300 p-4 text-blue-900">
          <h2 className="font-bold mb-3 flex items-center text-lg">
            <User className="mr-2" size={18} /> {username}
          </h2>
          <div className="flex justify-between items-center mb-2">
            <span className="flex items-center text-red-500 font-medium">
              <Wallet size={16} className="mr-2 text-red-500" /> Wallet
            </span>
            <span className="font-bold">{playerData.wallet} ₽</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="flex items-center text-blue-500 font-medium">
              <Bank size={16} className="mr-2 text-blue-500" /> Bank
            </span>
            <span className="font-bold">{playerData.bank} ₽</span>
          </div>
        </Card>
        
        {/* Inventory Card */}
        <Card className="bg-blue-100 border-2 border-blue-300 p-4 text-blue-900">
          <h2 className="font-bold mb-3 flex items-center text-lg">
            <Package className="mr-2" size={18} /> Inventory
          </h2>
          <div className="text-sm space-y-2">
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
              <span className="mr-1">Pokéballs:</span>
              <span className="font-bold">{playerData.inventory.pokeball}</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
              <span className="mr-1">Great:</span>
              <span className="font-bold">{playerData.inventory.greatball}</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-black mr-2"></div>
              <span className="mr-1">Ultra:</span>
              <span className="font-bold">{playerData.inventory.ultraball}</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-purple-500 mr-2"></div>
              <span className="mr-1">Master:</span>
              <span className="font-bold">{playerData.inventory.masterball}</span>
            </div>
          </div>
        </Card>
        
        {/* Party Card */}
        <Card className="bg-blue-100 border-2 border-blue-300 p-4 text-blue-900 flex-1">
          <h2 className="font-bold mb-3 flex items-center text-lg">
            <Gamepad className="mr-2" size={18} /> Party
          </h2>
          
          {playerData.party.length === 0 ? (
            <div className="text-center italic text-gray-500 py-4">
              No Pokémon yet
            </div>
          ) : (
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {playerData.party.map((pokemon, index) => (
                <div key={index} className="flex items-center bg-white/50 rounded-lg p-2 shadow-sm">
                  {pokemon.image ? (
                    <img src={pokemon.image} alt={pokemon.name} className="w-12 h-12 mr-3 object-contain" />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded-full mr-3 flex items-center justify-center text-gray-400">?</div>
                  )}
                  <div>
                    <div className="font-medium capitalize">{pokemon.name}</div>
                    <div className="text-xs">Level {pokemon.level}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Chat;
