import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { ref, set, get, onValue } from 'firebase/database';
import { PlayerData } from '@/types/gameTypes';

// Default player data
const DEFAULT_PLAYER_DATA: PlayerData = {
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
};

export const usePlayerData = (username: string) => {
  const [playerData, setPlayerData] = useState<PlayerData>(DEFAULT_PLAYER_DATA);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load saved data on mount
  useEffect(() => {
    if (!username) {
      setIsLoading(false);
      return;
    }
    
    const playerRef = ref(db, `players/${username}`);
    console.log("Loading player data for:", username);
    
    // Use onValue to keep data in sync with Firebase in real-time
    const unsubscribe = onValue(playerRef, (snapshot) => {
      if (snapshot.exists()) {
        const savedData = snapshot.val();
        console.log("Found player data in Firebase:", savedData);
        
        // Merge saved data with defaults to ensure all properties exist
        const mergedData = {
          ...DEFAULT_PLAYER_DATA,
          ...savedData,
          // Make sure nested objects are properly merged
          inventory: {
            ...DEFAULT_PLAYER_DATA.inventory,
            ...(savedData.inventory || {})
          },
          party: savedData.party || [],
          pc: savedData.pc || [],
          bannedUsers: savedData.bannedUsers || []
        };
        
        setPlayerData(mergedData);
      } else {
        console.log("No player data found in Firebase, creating default data");
        // Initialize player data in Firebase
        set(playerRef, DEFAULT_PLAYER_DATA)
          .then(() => console.log("Default player data initialized"))
          .catch(err => console.error("Error initializing player data:", err));
          
        setPlayerData(DEFAULT_PLAYER_DATA);
      }
      
      setIsLoading(false);
    }, (error) => {
      console.error("Error loading player data from Firebase:", error);
      setIsLoading(false);
    });

    // Clean up listener on unmount
    return () => unsubscribe();
  }, [username]);

  // Custom setter that updates both local state and Firebase
  const updatePlayerData = (newData: Partial<PlayerData> | ((prev: PlayerData) => PlayerData)) => {
    if (!username) return;
    
    // Handle both direct updates and function updates
    setPlayerData(prevData => {
      const nextData = typeof newData === 'function' 
        ? newData(prevData) 
        : { ...prevData, ...newData };
      
      // Save updated data to Firebase
      const playerRef = ref(db, `players/${username}`);
      set(playerRef, nextData)
        .catch(err => console.error("Error saving player data to Firebase:", err));
      
      console.log("Saving player data for:", username);
      return nextData;
    });
  };

  return { 
    playerData, 
    setPlayerData: updatePlayerData,
    isLoading 
  };
};
