
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
      if (!username) return;
      
      try {
        console.log("Loading player data for:", username);
        const playerRef = ref(db, `players/${username}`);
        const snapshot = await get(playerRef);
        
        if (snapshot.exists()) {
          console.log("Found player data in Firebase:", snapshot.val());
          const savedData = snapshot.val();
          setPlayerData(prevData => ({
            ...prevData,
            ...savedData,
            // Ensure all required properties exist
            inventory: {
              pokeball: 5,
              greatball: 0,
              ultraball: 0,
              masterball: 0,
              ...(savedData.inventory || {})
            },
            party: savedData.party || [],
            pc: savedData.pc || [],
          }));
        } else {
          console.log("No player data found in Firebase, checking localStorage");
          const localData = localStorage.getItem(`pokemonSave_${username}`);
          if (localData) {
            try {
              const parsedData = JSON.parse(localData);
              console.log("Loaded data from localStorage:", parsedData);
              setPlayerData(prevData => ({
                ...prevData,
                ...parsedData,
                // Ensure all required properties exist
                inventory: {
                  pokeball: 5,
                  greatball: 0,
                  ultraball: 0,
                  masterball: 0,
                  ...(parsedData.inventory || {})
                },
                party: parsedData.party || [],
                pc: parsedData.pc || [],
              }));
              
              // Save to Firebase for future use
              const playerRef = ref(db, `players/${username}`);
              await set(playerRef, parsedData);
            } catch (e) {
              console.error("Error loading saved data from localStorage", e);
            }
          } else {
            console.log("Creating new player data");
            // Save default data to Firebase for new users
            const playerRef = ref(db, `players/${username}`);
            await set(playerRef, playerData);
          }
        }
      } catch (error) {
        console.error("Error loading player data from Firebase:", error);
        // Try localStorage as fallback
        const localData = localStorage.getItem(`pokemonSave_${username}`);
        if (localData) {
          try {
            setPlayerData(JSON.parse(localData));
          } catch (e) {
            console.error("Error loading saved data from localStorage", e);
          }
        }
      }
    };

    loadPlayerData();
  }, [username]);

  // Save player data when it changes
  useEffect(() => {
    if (!username) return;
    
    console.log("Saving player data for:", username, playerData);
    
    // Save to localStorage as backup
    localStorage.setItem(`pokemonSave_${username}`, JSON.stringify(playerData));
    
    // Save to Firebase
    const playerRef = ref(db, `players/${username}`);
    set(playerRef, playerData).catch(err => {
      console.error("Error saving player data to Firebase:", err);
    });
  }, [playerData, username]);

  return { playerData, setPlayerData };
};
