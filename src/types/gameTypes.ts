
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
  pc: any[];
  lastSpawn: any;
  lastDailyClaim: number | null;
  xp: number;
  level: number;
  bonusUsed: boolean;
  lastSlotPlay: number | null;
  lastInterestClaim: number | null;
  bannedUsers: string[];
  lastRob: number | null;
}
