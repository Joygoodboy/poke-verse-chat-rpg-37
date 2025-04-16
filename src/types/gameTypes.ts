
export interface Message {
  user: string;
  text: string;
  image?: string | null;
}

export interface Pokemon {
  name: string;
  image: string;
  level: number;
  xp: number;
  moves: string[];
  type?: string;
  attack?: number;
  defense?: number;
  speed?: number;
  hp?: number;
  maxHp?: number;
}

export interface PlayerData {
  inventory: { 
    pokeball: number;
    greatball: number;
    ultraball: number;
    masterball: number;
  };
  wallet: number;
  bank: number;
  party: Pokemon[];
  pc: Pokemon[];
  lastSpawn: Pokemon | null;
  lastDailyClaim: number | null;
  xp: number;
  level: number;
  bonusUsed: boolean;
  lastSlotPlay: number | null;
  lastInterestClaim: number | null;
  bannedUsers: string[];
  lastRob: number | null;
}
