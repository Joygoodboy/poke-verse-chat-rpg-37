
import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { ref, push, onValue, set, remove, update } from 'firebase/database';
import { Pokemon } from '@/types/gameTypes';

export interface PokemonMove {
  name: string;
  power: number;
  type: string;
  accuracy: number;
}

export interface BattlePokemon extends Pokemon {
  health: number;
  maxHealth: number;
  moves: PokemonMove[];
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
}

export const usePokemonBattle = (username: string) => {
  const [activeBattle, setActiveBattle] = useState<BattleState | null>(null);
  const [pendingChallenge, setPendingChallenge] = useState<string | null>(null);
  const [selectingPokemon, setSelectingPokemon] = useState(false);
  
  // Initialize battle listener
  useEffect(() => {
    if (!username) return;
    
    console.log("Initializing battle listener for:", username);
    const battleRef = ref(db, "battles");
    
    const unsubscribe = onValue(battleRef, (snapshot) => {
      if (snapshot.exists()) {
        const battles = snapshot.val();
        
        // Find a battle where the user is involved
        for (const battleId in battles) {
          const battle = battles[battleId] as BattleState;
          
          if (battle.challenger === username || battle.opponent === username) {
            console.log("Found active battle:", battle);
            setActiveBattle({
              ...battle,
              id: battleId
            });
            
            // Check if user needs to select a Pokémon
            if (battle.challenger === username && !battle.challengerSelectedPokemon) {
              setSelectingPokemon(true);
            } else if (battle.opponent === username && !battle.opponentSelectedPokemon) {
              setSelectingPokemon(true);
            } else {
              setSelectingPokemon(false);
            }
            
            return;
          }
        }
      }
      
      // If we get here, user is not in any battle
      setActiveBattle(null);
      setSelectingPokemon(false);
    });

    return () => {
      unsubscribe();
    };
  }, [username]);
  
  // Challenge another player
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
  
  // Accept a challenge
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
    
    set(battleRef, {
      ...activeBattle,
      isActive: true,
      logs: [...activeBattle.logs, `${username} accepted the challenge!`]
    });
    
    broadcast("You accepted the challenge! Select a Pokémon to battle with by using the selector below or by typing /select [number]");
    setSelectingPokemon(true);
    setPendingChallenge(null);
  };
  
  // Select a Pokemon for battle
  const selectPokemon = (pokemon: Pokemon, broadcast: (text: string) => void) => {
    if (!activeBattle || !selectingPokemon) {
      broadcast("No active battle or not in selection phase.");
      return;
    }
    
    console.log("Selecting Pokémon for battle:", pokemon);
    
    // Generate random moves for the Pokemon
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
    
    // Calculate health based on level
    const health = pokemon.level * 20 + 50;
    
    const battlePokemon: BattlePokemon = {
      ...pokemon,
      health,
      maxHealth: health,
      moves
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
    setSelectingPokemon(false);
  };
  
  // Execute a move
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
    
    const attackerPokemon = username === activeBattle.challenger ? activeBattle.challengerPokemon : activeBattle.opponentPokemon;
    const defenderPokemon = username === activeBattle.challenger ? activeBattle.opponentPokemon : activeBattle.challengerPokemon;
    const defender = username === activeBattle.challenger ? activeBattle.opponent : activeBattle.challenger;
    
    if (moveIndex < 0 || moveIndex >= attackerPokemon.moves.length) {
      broadcast("Invalid move index!");
      return;
    }
    
    const move = attackerPokemon.moves[moveIndex];
    
    // Calculate if the move hits (based on accuracy)
    const hitRoll = Math.random() * 100;
    if (hitRoll > move.accuracy) {
      const battleRef = ref(db, `battles/${activeBattle.id}`);
      
      update(battleRef, {
        turn: defender,
        logs: [...activeBattle.logs, `${attackerPokemon.name}'s ${move.name} missed!`]
      });
      
      broadcast(`Your ${attackerPokemon.name}'s ${move.name} missed!`);
      return;
    }
    
    // Calculate damage
    const damage = Math.floor((attackerPokemon.level * 0.4 + 2) * move.power / 50);
    const newHealth = Math.max(0, defenderPokemon.health - damage);
    
    const newDefenderPokemon = {
      ...defenderPokemon,
      health: newHealth
    };
    
    let logs = [...activeBattle.logs, `${attackerPokemon.name} used ${move.name} and dealt ${damage} damage to ${defenderPokemon.name}!`];
    let winner = null;
    
    if (newHealth <= 0) {
      logs.push(`${defenderPokemon.name} fainted! ${username} won the battle!`);
      winner = username;
    }
    
    const battleRef = ref(db, `battles/${activeBattle.id}`);
    const updates: any = {
      logs,
      turn: winner ? '' : defender,
      winner
    };
    
    if (username === activeBattle.challenger) {
      updates.opponentPokemon = newDefenderPokemon;
    } else {
      updates.challengerPokemon = newDefenderPokemon;
    }
    
    update(battleRef, updates);
    
    broadcast(`Your ${attackerPokemon.name} used ${move.name} and dealt ${damage} damage to ${defenderPokemon.name}!`);
    
    if (winner) {
      broadcast(`You won the battle against ${defender}!`);
      setTimeout(() => {
        endBattle();
      }, 5000);
    }
  };
  
  // Forfeit battle
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
  
  // End the battle and clean up
  const endBattle = () => {
    if (!activeBattle || !activeBattle.id) return;
    
    const battleRef = ref(db, `battles/${activeBattle.id}`);
    remove(battleRef);
    
    setActiveBattle(null);
    setPendingChallenge(null);
    setSelectingPokemon(false);
  };
  
  const initBattleListener = () => {
    console.log("Manual battle listener initialization");
    // This is just a placeholder since the actual initialization happens in useEffect
    // But we need to provide this function since it's being called in the Chat component
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
    forfeitBattle,
    endBattle
  };
};
