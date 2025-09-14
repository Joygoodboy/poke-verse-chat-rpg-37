import { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { ref, push, onValue, set, remove, update, get } from 'firebase/database';
import { Pokemon } from '@/types/gameTypes';

export interface PokemonMove {
  name: string;
  power: number;
  type: string;
  accuracy: number;
}

export interface BattlePokemon extends Omit<Pokemon, 'moves'> {
  health: number;
  maxHealth: number;
  moves: PokemonMove[];
  type?: string;
}

export interface BattleState {
  id?: string;
  challenger: string;
  opponent: string;
  challengerPokemon: BattlePokemon | null;
  opponentPokemon: BattlePokemon | null;
  isActive: boolean;
  turn: string;
  logs: string[];
  winner: string | null;
  challengerSelectedPokemon: boolean;
  opponentSelectedPokemon: boolean;
  lastAttack?: {
    attacker: string;
    defender: string;
    moveName: string;
    damage: number;
    isCritical: boolean;
    effectiveness: number;
  };
}

export const usePokemonBattle = (username: string) => {
  const [activeBattle, setActiveBattle] = useState<BattleState | null>(null);
  const [pendingChallenge, setPendingChallenge] = useState<string | null>(null);
  const [selectingPokemon, setSelectingPokemon] = useState(false);
  const battleRef = useRef<any>(null);
  
  useEffect(() => {
    if (!username) return;
    
    console.log("Initializing battle listener for:", username);
    const battlesRef = ref(db, "battles");
    
    const unsubscribe = onValue(battlesRef, (snapshot) => {
      if (snapshot.exists()) {
        const battles = snapshot.val();
        
        for (const battleId in battles) {
          const battle = battles[battleId] as BattleState;
          
          if (battle.challenger === username || battle.opponent === username) {
            console.log("Found active battle:", battle);
            
            // Store the battle reference for later use
            battleRef.current = ref(db, `battles/${battleId}`);
            
            setActiveBattle({
              ...battle,
              id: battleId
            });
            
            const bothPokemonSelected = battle.challengerSelectedPokemon && battle.opponentSelectedPokemon;
            
            if (battle.challenger === username && !battle.challengerSelectedPokemon) {
              setSelectingPokemon(true);
            } else if (battle.opponent === username && !battle.opponentSelectedPokemon) {
              setSelectingPokemon(true);
            } else {
              setSelectingPokemon(false);
            }
            
            if (bothPokemonSelected) {
              setSelectingPokemon(false);
              
              if (battle.logs.length > 0 && !battle.logs[battle.logs.length - 1].includes("battle begins")) {
                update(ref(db, `battles/${battleId}`), {
                  logs: [...battle.logs, "Both trainers have selected their Pokémon! The battle begins!"]
                });
              }
            }
            
            return;
          }
        }
      }
      
      setActiveBattle(null);
      setSelectingPokemon(false);
      battleRef.current = null;
    });

    return () => {
      unsubscribe();
    };
  }, [username]);
  
  const challengePlayer = (opponentName: string, broadcast: (text: string) => void) => {
    if (activeBattle) {
      broadcast("You are already in a battle!");
      return;
    }
    
    const battleRef = ref(db, "battles");
    const newBattle: BattleState = {
      challenger: username,
      opponent: opponentName,
      challengerPokemon: null,
      opponentPokemon: null,
      challengerSelectedPokemon: false,
      opponentSelectedPokemon: false,
      isActive: false,
      turn: username,
      logs: [`${username} has challenged ${opponentName} to a Pokémon battle!`],
      winner: null
    };
    
    push(battleRef, newBattle);
    broadcast(`You challenged ${opponentName} to a Pokémon battle! Waiting for them to accept...`);
    setPendingChallenge(opponentName);
  };
  
  const acceptChallenge = (broadcast: (text: string) => void) => {
    if (!activeBattle) {
      broadcast("No pending challenge found.");
      return;
    }
    
    if (activeBattle.opponent !== username || activeBattle.isActive) {
      broadcast("No valid challenge to accept.");
      return;
    }
    
    const battleRef = ref(db, `battles/${activeBattle.id}`);
    
    update(battleRef, {
      isActive: true,
      logs: [...activeBattle.logs, `${username} accepted the challenge!`]
    });
    
    broadcast("You accepted the challenge! Select a Pokémon to battle with by using the selector below or by typing /select [number]");
    setSelectingPokemon(true);
    setPendingChallenge(null);
  };
  
  const getPokemonType = (name: string): string => {
    const typeMap: Record<string, string> = {
      bulbasaur: "grass", ivysaur: "grass", venusaur: "grass",
      charmander: "fire", charmeleon: "fire", charizard: "fire",
      squirtle: "water", wartortle: "water", blastoise: "water",
      pikachu: "electric", raichu: "electric",
      // ... more could be added
    };
    
    return typeMap[name.toLowerCase()] || "normal";
  };
  
  const selectPokemon = (pokemon: Pokemon, broadcast: (text: string) => void) => {
    if (!activeBattle || !selectingPokemon) {
      broadcast("No active battle or not in selection phase.");
      return;
    }
    
    console.log("Selecting Pokémon for battle:", pokemon);
    
    const moveTypes = ["Normal", "Fire", "Water", "Electric", "Grass", "Ice", "Fighting", "Poison", "Ground"];
    const moveNames = [
      "Tackle", "Slam", "Quick Attack", "Bite", "Scratch", "Pound", "Headbutt",
      "Ember", "Water Gun", "Thundershock", "Vine Whip", "Ice Beam", "Karate Chop"
    ];
    
    const generateMove = (): PokemonMove => {
      const name = moveNames[Math.floor(Math.random() * moveNames.length)];
      const type = moveTypes[Math.floor(Math.random() * moveTypes.length)];
      const power = Math.floor(Math.random() * 50) + 20; // 20-70 power
      const accuracy = Math.floor(Math.random() * 20) + 80; // 80-100 accuracy
      
      return { name, type, power, accuracy };
    };
    
    const moves: PokemonMove[] = [
      generateMove(),
      generateMove(),
      generateMove(),
      generateMove()
    ];
    
    const health = pokemon.level * 20 + 50;
    
    const type = getPokemonType(pokemon.name);
    
    const battlePokemon: BattlePokemon = {
      ...pokemon,
      health,
      maxHealth: health,
      moves,
      type
    };
    
    const battleRef = ref(db, `battles/${activeBattle.id}`);
    const isChallenger = username === activeBattle.challenger;
    
    const updates: Partial<BattleState> = isChallenger 
      ? { 
          challengerPokemon: battlePokemon, 
          challengerSelectedPokemon: true,
          logs: [...activeBattle.logs, `${username} chose ${pokemon.name}!`]
        }
      : {
          opponentPokemon: battlePokemon,
          opponentSelectedPokemon: true,
          logs: [...activeBattle.logs, `${username} chose ${pokemon.name}!`]
        };
    
    update(battleRef, updates);
    
    broadcast(`You chose ${pokemon.name} for battle!`);
    
    const otherPlayerSelected = isChallenger 
      ? activeBattle.opponentSelectedPokemon 
      : activeBattle.challengerSelectedPokemon;
      
    if (otherPlayerSelected) {
      update(battleRef, {
        logs: [...activeBattle.logs, ...(updates.logs || []), "Both trainers have selected their Pokémon! The battle begins!"]
      });
      broadcast("Both trainers have selected their Pokémon! The battle begins!");
    } else {
      broadcast("Waiting for the other trainer to select their Pokémon...");
    }
    
    setSelectingPokemon(false);
  };
  
  const getTypeEffectiveness = (moveType: string, defenderType: string): number => {
    const typeChart: Record<string, { superEffective: string[], notVeryEffective: string[] }> = {
      fire: {
        superEffective: ["grass", "ice", "bug"],
        notVeryEffective: ["fire", "water", "rock"]
      },
      water: {
        superEffective: ["fire", "ground", "rock"],
        notVeryEffective: ["water", "grass"]
      },
      grass: {
        superEffective: ["water", "ground", "rock"],
        notVeryEffective: ["fire", "grass", "poison", "flying", "bug"]
      },
      electric: {
        superEffective: ["water", "flying"],
        notVeryEffective: ["electric", "grass"]
      },
      ice: {
        superEffective: ["grass", "ground", "flying", "dragon"],
        notVeryEffective: ["fire", "water", "ice"]
      },
      fighting: {
        superEffective: ["normal", "ice", "rock"],
        notVeryEffective: ["poison", "flying", "psychic", "bug"]
      },
      normal: {
        superEffective: [],
        notVeryEffective: ["rock"]
      }
    };
    
    const matchup = typeChart[moveType.toLowerCase()];
    if (!matchup) return 1.0;
    
    if (matchup.superEffective.includes(defenderType.toLowerCase())) {
      return 2.0;
    }
    
    if (matchup.notVeryEffective.includes(defenderType.toLowerCase())) {
      return 0.5;
    }
    
    return 1.0;
  };
  
  const executeMove = (moveIndex: number, broadcast: (text: string) => void) => {
    if (!activeBattle || !activeBattle.isActive) {
      broadcast("No active battle found!");
      return;
    }
    
    if (!activeBattle.challengerPokemon || !activeBattle.opponentPokemon) {
      broadcast("Both players must select their Pokémon first!");
      return;
    }
    
    if (activeBattle.turn !== username) {
      broadcast("It's not your turn!");
      return;
    }
    
    // Make sure we have a valid battle reference
    if (!battleRef.current) {
      console.error("Battle reference is null!");
      broadcast("Error executing move. Please try again.");
      return;
    }
    
    const attackerPokemon = username === activeBattle.challenger ? activeBattle.challengerPokemon : activeBattle.opponentPokemon;
    const defenderPokemon = username === activeBattle.challenger ? activeBattle.opponentPokemon : activeBattle.challengerPokemon;
    const defender = username === activeBattle.challenger ? activeBattle.opponent : activeBattle.challenger;
    
    if (moveIndex < 0 || moveIndex >= attackerPokemon.moves.length) {
      broadcast("Invalid move index!");
      return;
    }
    
    const move = attackerPokemon.moves[moveIndex];
    
    const hitRoll = Math.random() * 100;
    if (hitRoll > move.accuracy) {
      update(battleRef.current, {
        turn: defender,
        logs: [...activeBattle.logs, `${attackerPokemon.name}'s ${move.name} missed!`]
      });
      
      broadcast(`Your ${attackerPokemon.name}'s ${move.name} missed!`);
      return;
    }
    
    const effectiveness = getTypeEffectiveness(
      move.type, 
      defenderPokemon.type || "normal"
    );
    
    const isCritical = Math.random() < 0.0625;
    const criticalMod = isCritical ? 1.5 : 1.0;
    
    const baseDamage = Math.floor((attackerPokemon.level * 0.4 + 2) * move.power / 50);
    const damage = Math.max(1, Math.floor(baseDamage * effectiveness * criticalMod));
    
    const newHealth = Math.max(0, defenderPokemon.health - damage);
    
    const newDefenderPokemon = {
      ...defenderPokemon,
      health: newHealth
    };
    
    let logs = [...activeBattle.logs];
    let hitMessage = `${attackerPokemon.name} used ${move.name} and dealt ${damage} damage to ${defenderPokemon.name}!`;
    
    if (effectiveness > 1) {
      hitMessage += " It's super effective!";
    } else if (effectiveness < 1) {
      hitMessage += " It's not very effective...";
    }
    
    if (isCritical) {
      hitMessage += " Critical hit!";
    }
    
    logs.push(hitMessage);
    
    let winner = null;
    
    if (newHealth <= 0) {
      logs.push(`${defenderPokemon.name} fainted! ${username} won the battle!`);
      winner = username;
    }
    
    const lastAttack = {
      attacker: attackerPokemon.name,
      defender: defenderPokemon.name,
      moveName: move.name,
      damage,
      isCritical,
      effectiveness
    };
    
    const updates: any = {
      logs,
      turn: winner ? '' : defender,
      winner,
      lastAttack
    };
    
    if (username === activeBattle.challenger) {
      updates.opponentPokemon = newDefenderPokemon;
    } else {
      updates.challengerPokemon = newDefenderPokemon;
    }
    
    update(battleRef.current, updates);
    
    broadcast(hitMessage);
    
    if (winner) {
      const playerRef = ref(db, `players/${username}`);
      const xpGained = 50 + (defenderPokemon.level * 5);
      
      get(playerRef).then((snapshot) => {
        if (snapshot.exists()) {
          const playerData = snapshot.val();
          const updatedParty = [...(playerData.party || [])];
          
          const pokemonIndex = updatedParty.findIndex(p => 
            p.name === attackerPokemon.name && 
            p.level === attackerPokemon.level
          );
          
          if (pokemonIndex >= 0) {
            const pokemon = updatedParty[pokemonIndex];
            const currentXp = pokemon.xp || 0;
            const newXp = currentXp + xpGained;
            const xpToLevelUp = pokemon.level * 100;
            
            if (newXp >= xpToLevelUp) {
              updatedParty[pokemonIndex] = {
                ...pokemon,
                level: pokemon.level + 1,
                xp: newXp - xpToLevelUp
              };
              broadcast(`Your ${pokemon.name} leveled up to level ${pokemon.level + 1}!`);
            } else {
              updatedParty[pokemonIndex] = {
                ...pokemon,
                xp: newXp
              };
              broadcast(`Your ${pokemon.name} gained ${xpGained} XP! (${newXp}/${xpToLevelUp})`);
            }
            
            update(playerRef, { party: updatedParty });
          }
        }
      });
      
      broadcast(`You won the battle against ${defender}!`);
      setTimeout(() => {
        endBattle();
      }, 5000);
    }
  };
  
  const getPokemonStats = (broadcast: (text: string, image?: string | null) => void) => {
    if (!activeBattle) {
      broadcast("No active battle found!");
      return;
    }
    
    const isChallenger = username === activeBattle.challenger;
    const pokemon = isChallenger ? activeBattle.challengerPokemon : activeBattle.opponentPokemon;
    
    if (!pokemon) {
      broadcast("You haven't selected a Pokémon for battle yet!");
      return;
    }
    
    let statsText = `
📊 **Battle Stats for ${pokemon.name}** (Level ${pokemon.level}) 📊

❤️ HP: ${pokemon.health}/${pokemon.maxHealth}
⚔️ Type: ${pokemon.type || "Normal"}
✨ XP: ${pokemon.xp || 0}/${pokemon.level * 100}

🏹 Moves:
`;
    
    pokemon.moves.forEach((move, index) => {
      statsText += `${index + 1}. ${move.name} (${move.power} Power, ${move.accuracy}% Accuracy, ${move.type} Type)\n`;
    });
    
    statsText += `\nUse "/battle [move number]" to use a move. For example, "/battle 1" to use ${pokemon.moves[0]?.name || "first move"}.`;
    
    broadcast(statsText, pokemon.image);
  };
  
  const forfeitBattle = (broadcast: (text: string) => void) => {
    if (!activeBattle) {
      broadcast("No active battle found!");
      return;
    }
    
    const winner = username === activeBattle.challenger ? activeBattle.opponent : activeBattle.challenger;
    const battleRef = ref(db, `battles/${activeBattle.id}`);
    
    update(battleRef, {
      logs: [...activeBattle.logs, `${username} forfeited the battle! ${winner} wins!`],
      winner
    });
    
    broadcast(`You forfeited the battle. ${winner} wins!`);
    
    setTimeout(() => {
      endBattle();
    }, 5000);
  };
  
  const endBattle = () => {
    if (!battleRef.current) return;
    
    remove(battleRef.current);
    
    setActiveBattle(null);
    setPendingChallenge(null);
    setSelectingPokemon(false);
    battleRef.current = null;
  };
  
  const initBattleListener = () => {
    console.log("Manual battle listener initialization");
  };

  return {
    activeBattle,
    pendingChallenge,
    selectingPokemon,
    initBattleListener,
    challengePlayer,
    acceptChallenge,
    selectPokemon,
    executeMove,
    getPokemonStats,
    forfeitBattle,
    endBattle
  };
};
