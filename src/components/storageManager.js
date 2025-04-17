
import { ref, set, get, onValue } from 'firebase/database';
import { db } from '../firebase';

export class StorageManager {
  constructor() {
    this.fusionStorageKey = 'pokemon_fusions';
    this.gameDataStorageKey = 'pokemon_game_data';
    this.userStorageKey = 'pokemon_user_data';
  }

  // Fusion storage methods
  async saveFusion(fusion) {
    try {
      const fusions = await this.getAllFusions();
      fusions.unshift(fusion);
      localStorage.setItem(this.fusionStorageKey, JSON.stringify(fusions));
      
      // If user is logged in, also save to Firebase
      const username = localStorage.getItem("loggedInUser");
      if (username) {
        const fusionsRef = ref(db, `users/${username}/fusions`);
        set(fusionsRef, fusions);
      }
    } catch (error) {
      console.error('Failed to save fusion:', error);
      throw error;
    }
  }

  async getAllFusions() {
    try {
      // First check if user is logged in
      const username = localStorage.getItem("loggedInUser");
      if (username) {
        // Try to get fusions from Firebase
        const fusionsRef = ref(db, `users/${username}/fusions`);
        const snapshot = await get(fusionsRef);
        
        if (snapshot.exists()) {
          return snapshot.val();
        }
        
        // If Firebase doesn't have data, check localStorage
        const fusions = localStorage.getItem(this.fusionStorageKey);
        const result = fusions ? JSON.parse(fusions) : [];
        
        // Save localStorage data to Firebase for future use
        set(fusionsRef, result);
        
        return result;
      }
      
      // If not logged in, just use localStorage
      const fusions = localStorage.getItem(this.fusionStorageKey);
      return fusions ? JSON.parse(fusions) : [];
    } catch (error) {
      console.error('Failed to get fusions:', error);
      return [];
    }
  }

  async deleteFusion(id) {
    try {
      const fusions = await this.getAllFusions();
      const updatedFusions = fusions.filter(fusion => fusion.id !== id);
      localStorage.setItem(this.fusionStorageKey, JSON.stringify(updatedFusions));
      
      // If user is logged in, also update Firebase
      const username = localStorage.getItem("loggedInUser");
      if (username) {
        const fusionsRef = ref(db, `users/${username}/fusions`);
        set(fusionsRef, updatedFusions);
      }
    } catch (error) {
      console.error('Failed to delete fusion:', error);
      throw error;
    }
  }

  // Game data persistence methods
  saveGameData(gameData) {
    try {
      localStorage.setItem(this.gameDataStorageKey, JSON.stringify(gameData));
      
      // If user is logged in, also save to Firebase
      const username = localStorage.getItem("loggedInUser");
      if (username) {
        const gameDataRef = ref(db, `users/${username}/gameData`);
        set(gameDataRef, gameData);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to save game data:', error);
      return false;
    }
  }

  loadGameData() {
    try {
      // First check if user is logged in
      const username = localStorage.getItem("loggedInUser");
      
      if (username) {
        // Try to load from Firebase
        return new Promise((resolve) => {
          const gameDataRef = ref(db, `users/${username}/gameData`);
          onValue(gameDataRef, (snapshot) => {
            if (snapshot.exists()) {
              resolve(snapshot.val());
            } else {
              // If not in Firebase, try localStorage
              const gameData = localStorage.getItem(this.gameDataStorageKey);
              const parsedData = gameData ? JSON.parse(gameData) : null;
              
              // If found in localStorage, save to Firebase for future
              if (parsedData) {
                set(gameDataRef, parsedData);
              }
              
              resolve(parsedData);
            }
          }, { onlyOnce: true });
        });
      }
      
      // If not logged in, just use localStorage
      const gameData = localStorage.getItem(this.gameDataStorageKey);
      return gameData ? JSON.parse(gameData) : null;
    } catch (error) {
      console.error('Failed to load game data:', error);
      return null;
    }
  }

  // User data persistence methods
  saveUserData(userData) {
    try {
      localStorage.setItem(this.userStorageKey, JSON.stringify(userData));
      
      // If this is a username, save to Firebase
      if (userData && userData.username) {
        const userRef = ref(db, `users/${userData.username}/profile`);
        set(userRef, userData);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to save user data:', error);
      return false;
    }
  }

  loadUserData() {
    try {
      // Check if user is logged in
      const username = localStorage.getItem("loggedInUser");
      
      if (username) {
        // Try to load from Firebase
        return new Promise((resolve) => {
          const userRef = ref(db, `users/${username}/profile`);
          onValue(userRef, (snapshot) => {
            if (snapshot.exists()) {
              resolve(snapshot.val());
            } else {
              // If not in Firebase, try localStorage
              const userData = localStorage.getItem(this.userStorageKey);
              const parsedData = userData ? JSON.parse(userData) : null;
              
              // If found in localStorage, save to Firebase for future
              if (parsedData) {
                set(userRef, parsedData);
              }
              
              resolve(parsedData);
            }
          }, { onlyOnce: true });
        });
      }
      
      // If not logged in, just use localStorage
      const userData = localStorage.getItem(this.userStorageKey);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Failed to load user data:', error);
      return null;
    }
  }

  // Check if a user is an admin or owner
  isAdminUser(username, owners = [], admins = []) {
    if (!username) return false;
    const lowerUsername = username.toLowerCase();
    return owners.some(owner => owner.toLowerCase() === lowerUsername) || 
           admins.some(admin => admin.toLowerCase() === lowerUsername);
  }

  isOwnerUser(username, owners = []) {
    if (!username) return false;
    const lowerUsername = username.toLowerCase();
    return owners.some(owner => owner.toLowerCase() === lowerUsername);
  }

  // Clear specific data
  clearGameData() {
    localStorage.removeItem(this.gameDataStorageKey);
    
    // Also clear from Firebase if user is logged in
    const username = localStorage.getItem("loggedInUser");
    if (username) {
      const gameDataRef = ref(db, `users/${username}/gameData`);
      set(gameDataRef, null);
    }
  }

  clearUserData() {
    localStorage.removeItem(this.userStorageKey);
    
    // Also clear from Firebase if user is logged in
    const username = localStorage.getItem("loggedInUser");
    if (username) {
      const userRef = ref(db, `users/${username}/profile`);
      set(userRef, null);
    }
  }

  clearAllData() {
    this.clearGameData();
    this.clearUserData();
    localStorage.removeItem(this.fusionStorageKey);
    
    // Also clear from Firebase if user is logged in
    const username = localStorage.getItem("loggedInUser");
    if (username) {
      const userDataRef = ref(db, `users/${username}`);
      set(userDataRef, null);
    }
  }
}
