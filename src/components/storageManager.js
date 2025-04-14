
export class StorageManager {
  constructor() {
    this.fusionStorageKey = 'pokemon_fusions';
    this.gameDataStorageKey = 'pokemon_game_data';
    this.userStorageKey = 'pokemon_user_data';
  }

  async saveFusion(fusion) {
    try {
      const fusions = await this.getAllFusions();
      fusions.unshift(fusion);
      localStorage.setItem(this.fusionStorageKey, JSON.stringify(fusions));
    } catch (error) {
      console.error('Failed to save fusion:', error);
      throw error;
    }
  }

  async getAllFusions() {
    try {
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
    } catch (error) {
      console.error('Failed to delete fusion:', error);
      throw error;
    }
  }

  // Game data persistence methods
  saveGameData(gameData) {
    try {
      localStorage.setItem(this.gameDataStorageKey, JSON.stringify(gameData));
      return true;
    } catch (error) {
      console.error('Failed to save game data:', error);
      return false;
    }
  }

  loadGameData() {
    try {
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
      return true;
    } catch (error) {
      console.error('Failed to save user data:', error);
      return false;
    }
  }

  loadUserData() {
    try {
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
  }

  clearUserData() {
    localStorage.removeItem(this.userStorageKey);
  }

  clearAllData() {
    this.clearGameData();
    this.clearUserData();
    localStorage.removeItem(this.fusionStorageKey);
  }
}
