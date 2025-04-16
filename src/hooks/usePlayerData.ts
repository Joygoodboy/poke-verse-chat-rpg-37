
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
    const loadPlayerData = async () => {
      try {
        const playerRef = ref(db, `players/${username}`);
        const snapshot = await get(playerRef);
        
        if (snapshot.exists()) {
          const savedData = snapshot.val();
          console.log("Loaded player data:", savedData);
          setPlayerData(savedData);
        } else {
          // If no data exists in Firebase, check localStorage as fallback
          const localData = localStorage.getItem("pokemonSave");
          if (localData) {
            try {
              setPlayerData(JSON.parse(localData));
            } catch (e) {
              console.error("Error loading saved data", e);
            }
          }
        }
      } catch (error) {
        console.error("Error loading player data from Firebase:", error);
        // Try localStorage as fallback
        const localData = localStorage.getItem("pokemonSave");
        if (localData) {
          try {
            setPlayerData(JSON.parse(localData));
          } catch (e) {
            console.error("Error loading saved data", e);
          }
        }
      }
    };

    loadPlayerData();
  }, [username]);

  // Save player data when it changes
  useEffect(() => {
    console.log("Saving player data:", playerData);
    localStorage.setItem("pokemonSave", JSON.stringify(playerData));
    const playerRef = ref(db, `players/${username}`);
    set(playerRef, playerData).catch(err => {
      console.error("Error saving player data to Firebase:", err);
    });
  }, [playerData, username]);

  return { playerData, setPlayerData };
};
