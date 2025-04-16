
import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { ref, set, get } from 'firebase/database';
import { PlayerData } from '@/types/gameTypes';

export const usePlayerData = (username: string) => {
  const [playerData, setPlayerData] = useState<PlayerData>({
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
    bannedUsers: [],
    lastRob: null
  });

  // Load saved data on mount
  useEffect(() => {
    const savedData = localStorage.getItem("pokemonSave");
    if (savedData) {
      try {
        setPlayerData(JSON.parse(savedData));
      } catch (e) {
        console.error("Error loading saved data", e);
      }
    }
  }, []);

  // Save player data when it changes
  useEffect(() => {
    localStorage.setItem("pokemonSave", JSON.stringify(playerData));
    const playerRef = ref(db, `players/${username}`);
    set(playerRef, playerData);
  }, [playerData, username]);

  return { playerData, setPlayerData };
};
