import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ChevronLeft, Send, Award, User, Wallet, Package, Gamepad, Gift, HelpCircle, Users, Shield, Crown } from "lucide-react";
import { db } from "../firebase";
import { ref, onChildAdded, push, onValue, onDisconnect, set, remove } from "firebase/database";
import { createCommandSystem, formatCommandOutput, isAdminUser, isOwnerUser } from "../utils/gameCommands";

const OWNER_LIST = ["Ash", "admin@pokemon.com", "owner@pokemon.com"];
const ADMIN_LIST = ["Gary", "mod@pokemon.com", "moderator@pokemon.com"];

const Chat = () => {
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<any[]>([]);
  const [username, setUsername] = useState<string>("");
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
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
    bonusUsed: false,
    lastSlotPlay: null,
    lastInterestClaim: null,
    owners: OWNER_LIST,
    mods: ADMIN_LIST,
    bannedUsers: []
  });
  
  const chatDivRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const commandSystemRef = useRef<any>(null);
  
  const catchRates = {
    pokeball: 0.5,
    greatball: 0.7,
    ultraball: 0.9,
    masterball: 1
  };

  const userIsAdmin = isAdminUser(username, OWNER_LIST, ADMIN_LIST);
  const userIsOwner = isOwnerUser(username, OWNER_LIST);

  useEffect(() => {
    commandSystemRef.current = createCommandSystem(playerData, setPlayerData);
  }, [playerData]);

  useEffect(() => {
    const storedUsername = localStorage.getItem("loggedInUser");
    if (!storedUsername) {
      navigate("/login");
      return;
    }
    setUsername(storedUsername);
    
    const savedData = localStorage.getItem("pokemonSave");
    if (savedData) {
      try {
        setPlayerData(JSON.parse(savedData));
      } catch (e) {
        console.error("Error loading saved data", e);
      }
    }

    const chatRef = ref(db, "chat");
    const unsubscribe = onChildAdded(chatRef, (snapshot) => {
      const message = snapshot.val();
      setMessages(prev => [...prev, message]);
    });

    const onlineUsersRef = ref(db, "online");
    const myPresenceRef = ref(db, `online/${storedUsername}`);
    
    set(myPresenceRef, true);
    
    onDisconnect(myPresenceRef).remove();
    
    const onlineUnsubscribe = onValue(onlineUsersRef, (snapshot) => {
      if (snapshot.exists()) {
        const users = Object.keys(snapshot.val());
        setOnlineUsers(users);
      } else {
        setOnlineUsers([]);
      }
    });

    return () => {
      unsubscribe();
      onlineUnsubscribe();
      remove(myPresenceRef);
    };
  }, [navigate]);

  useEffect(() => {
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
    const commandName = base.replace('/', '');
    const commandArgs = args.slice(1);
    
    if (commandSystemRef.current && commandSystemRef.current[commandName]) {
      const userData = { 
        isOwner: userIsOwner,
        isAdmin: userIsAdmin
      };
      
      const response = commandSystemRef.current[commandName](commandArgs, userData);
      broadcast(response);
      
      if (['slot', 'bank', 'daily', 'buy', 'buyball', 'ban', 'unban'].includes(commandName)) {
        localStorage.setItem("pokemonSave", JSON.stringify(playerData));
      }
    } else {
      handleTraditionalCommand(base, args);
    }
    
    setMessage("");
  };

  const handleTraditionalCommand = async (base: string, args: string[]) => {
    switch (base) {
      case "/help":
        broadcast(`📖 Available Commands:
🧰 General: /help, /ping, /pc, /mods, /owner
🎮 Pokémon: /party, /catch, /spawn, /move, /t2pc, /t2party, /release
🛒 Economy: /wallet, /bank [deposit/withdraw/interest] [amount], /slot, /daily
⚔️ Battle: /rb, /battle, /accept, /decline
📦 Storage: /save, /load
🛍️ Shop: /shop, /buyball, /pokemart, /buypokemon
👥 Social: /trade, /accepttrade, /broadcast
👑 Staff: /ban, /unban (owner only)
✨ Other: /mods, /owner, /rank, /inventory`);
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
        const imageUrl = `https://robohash.org/${encodeURIComponent(title)}.png?set=set2`;

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
              
              updated.xp += 50;
            } else {
              updated.pc.push(updated.lastSpawn);
              broadcast(`Party full! ${updated.lastSpawn.name} sent to PC.`);
              
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
      
      case "/ban":
        if (!userIsOwner && !userIsAdmin) {
          broadcast("❌ You don't have permission to use this command.");
          break;
        }

        const banUser = args[1];
        if (!banUser) {
          broadcast("❌ Please specify a username to ban.");
          break;
        }

        setPlayerData(prev => ({
          ...prev,
          bannedUsers: [...(prev.bannedUsers || []), banUser]
        }));

        const banReason = args.slice(2).join(" ") || "No reason provided";
        broadcast(`🚫 User ${banUser} has been banned. Reason: ${banReason}`);
        break;

      case "/unban":
        if (!userIsOwner && !userIsAdmin) {
          broadcast("❌ You don't have permission to use this command.");
          break;
        }

        const unbanUser = args[1];
        if (!unbanUser) {
          broadcast("❌ Please specify a username to unban.");
          break;
        }

        setPlayerData(prev => ({
          ...prev,
          bannedUsers: (prev.bannedUsers || []).filter(user => user !== unbanUser)
        }));

        broadcast(`✅ User ${unbanUser} has been unbanned.`);
        break;

      case "/broadcast":
        if (!userIsOwner && !userIsAdmin) {
          broadcast("❌ You don't have permission to use this command.");
          break;
        }

        const broadcastMessage = args.slice(1).join(" ");
        if (!broadcastMessage) {
          broadcast("❌ Please provide a message to broadcast.");
          break;
        }

        broadcast(`📣 [BROADCAST] ${broadcastMessage}`);
        break;

      case "/move":
        const pos1 = parseInt(args[1]);
        const pos2 = parseInt(args[2]);
        
        if (isNaN(pos1) || isNaN(pos2) || 
            pos1 < 0 || pos2 < 0 || 
            pos1 >= playerData.party.length || pos2 >= playerData.party.length) {
          broadcast("❌ Invalid positions. Use numbers within your party range.");
          break;
        }
        
        setPlayerData(prev => {
          const newParty = [...prev.party];
          [newParty[pos1], newParty[pos2]] = [newParty[pos2], newParty[pos1]];
          return { ...prev, party: newParty };
        });
        
        broadcast(`✅ Swapped positions ${pos1} and ${pos2} in your party.`);
        break;

      case "/release":
        const releasePos = parseInt(args[1]);
        
        if (isNaN(releasePos) || releasePos < 0 || releasePos >= playerData.party.length) {
          broadcast("❌ Invalid position. Use a number within your party range.");
          break;
        }
        
        const releasedPokemon = playerData.party[releasePos].name;
        
        setPlayerData(prev => {
          const newParty = [...prev.party];
          newParty.splice(releasePos, 1);
          return {
            ...prev,
            party: newParty,
            wallet: prev.wallet + 50
          };
        });
        
        broadcast(`😢 You released ${releasedPokemon} and received 50 coins as compensation.`);
        break;

      case "/buyball":
        const ballType = args[1]?.toLowerCase();
        const quantity = parseInt(args[2]) || 1;
        
        const ballPrices = {
          pokeball: 100,
          greatball: 250,
          ultraball: 500,
          masterball: 1000
        };
        
        if (!ballPrices[ballType]) {
          broadcast(`❌ Invalid ball type. Available types: ${Object.keys(ballPrices).join(", ")}`);
          break;
        }
        
        const totalCost = ballPrices[ballType] * quantity;
        
        if (playerData.wallet < totalCost) {
          broadcast(`💸 You don't have enough coins. Cost: ${totalCost} coins for ${quantity} ${ballType}(s).`);
          break;
        }
        
        setPlayerData(prev => ({
          ...prev,
          wallet: prev.wallet - totalCost,
          inventory: {
            ...prev.inventory,
            [ballType]: (prev.inventory[ballType] || 0) + quantity
          }
        }));
        
        broadcast(`🛒 You bought ${quantity} ${ballType}(s) for ${totalCost} coins.`);
        break;
      
      default:
        break;
    }
  };

  const handleCommandButton = (cmd: string) => {
    setMessage(cmd);
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
      <div className="hidden md:block w-64 bg-blue-200/30 backdrop-blur-sm p-4 border-r border-blue-300">
        <h2 className="text-white font-bold mb-4 flex items-center">
          <Users className="mr-2" size={18} /> Online Trainers
          <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">{onlineUsers.length} online</span>
        </h2>
        {onlineUsers.length > 0 ? (
          <div className="space-y-2">
            {onlineUsers.map((user, index) => (
              <div key={index} className="flex items-center text-white">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span>{user}</span>
                {userIsOwner && (
                  <button 
                    onClick={() => handleCommandButton(`/ban ${user}`)} 
                    className="ml-2 text-xs text-red-300 hover:text-red-100"
                    title="Ban user"
                  >
                    Ban
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-white/70 italic">
            No trainers online
          </div>
        )}

        {(userIsAdmin || userIsOwner) && (
          <div className="mt-6 p-3 bg-purple-500/30 rounded-lg backdrop-blur-sm">
            <h3 className="text-white font-bold mb-2 flex items-center">
              <Shield className="mr-2" size={16} /> Admin Controls
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                size="sm"
                className="bg-red-500/30 text-white border-red-400 hover:bg-red-600/50"
                onClick={() => handleCommandButton(`/broadcast`)}
              >
                Broadcast
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="bg-yellow-500/30 text-white border-yellow-400 hover:bg-yellow-600/50"
                onClick={() => handleCommandButton(`/mods`)}
              >
                View Mods
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="bg-purple-500/30 text-white border-purple-400 hover:bg-purple-600/50"
                onClick={() => handleCommandButton(`/owner`)}
              >
                <Crown className="mr-1" size={14} /> Owners
              </Button>
            </div>
          </div>
        )}
      </div>
      
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
          {userIsAdmin && <span className="ml-2 text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full">Admin</span>}
          {userIsOwner && <span className="ml-2 text-xs bg-yellow-500 text-white px-2 py-0.5 rounded-full">Owner</span>}
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
                    : msg.text && msg.text.includes("[BROADCAST]")
                      ? "bg-yellow-500/80 text-white w-full clear-both text-center"
                      : "bg-white/80 float-left text-left"
              }`}
            >
              <div><strong>{msg.user}:</strong> <span dangerouslySetInnerHTML={{ __html: msg.text }} /></div>
              {msg.image && <img src={msg.image} alt="Pokemon" className="max-w-[100px] mt-2" />}
            </div>
          ))}
        </div>
        
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
            onClick={() => handleCommandButton("/slot")}
          >
            Slot
          </Button>
          <Button 
            variant="outline"
            size="sm" 
            className="bg-red-500/30 text-white border-red-400 hover:bg-red-600/50"
            onClick={() => handleCommandButton("/bank")}
          >
            Bank
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
          <Button 
            variant="outline"
            size="sm" 
            className="bg-blue-300/30 text-white border-blue-200 hover:bg-blue-400/50"
            onClick={() => handleCommandButton("/buyball")}
          >
            Buy Ball
          </Button>
        </div>
        
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
      
      <div className="hidden md:flex flex-col w-64 bg-blue-200/30 backdrop-blur-sm p-4 border-l border-blue-300 gap-4">
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
              <Wallet size={16} className="mr-2 text-blue-500" /> Bank
            </span>
            <span className="font-bold">{playerData.bank} ₽</span>
          </div>
        </Card>
        
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
