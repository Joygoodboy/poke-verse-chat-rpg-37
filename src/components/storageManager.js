export class StorageManager {
  constructor() {
    this.storageKey = 'pokemon_fusions';
  }

  async saveFusion(fusion) {
    try {
      const fusions = await this.getAllFusions();
      fusions.unshift(fusion);
      localStorage.setItem(this.storageKey, JSON.stringify(fusions));
    } catch (error) {
      console.error('Failed to save fusion:', error);
      throw error;
    }
  }

  async getAllFusions() {
    try {
      const fusions = localStorage.getItem(this.storageKey);
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
      localStorage.setItem(this.storageKey, JSON.stringify(updatedFusions));
    } catch (error) {
      console.error('Failed to delete fusion:', error);
      throw error;
    }
  }
}

