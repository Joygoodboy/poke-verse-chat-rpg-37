
import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { ref, onChildAdded, push } from 'firebase/database';
import { createCommandSystem } from '../utils/gameCommands';
import { Pokemon } from '@/components/chat/PlayerInfo';

export interface Message {
  user: string;
  text: string;
  image?: string | null;
}

export interface PlayerData {
  inventory: { pokeball: number, greatball: number, ultraball: number, masterball: number };
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
}

export const useChat = (username: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
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
    bannedUsers: []
  });

  useEffect(() => {
    const chatRef = ref(db, "chat");
    const unsubscribe = onChildAdded(chatRef, (snapshot) => {
      const message = snapshot.val();
      setMessages(prev => [...prev, message]);
    });

    const savedData = localStorage.getItem("pokemonSave");
    if (savedData) {
      try {
        setPlayerData(JSON.parse(savedData));
      } catch (e) {
        console.error("Error loading saved data", e);
      }
    }

    return () => {
      unsubscribe();
    };
  }, []);

  const broadcast = (text: string, image: string | null = null) => {
    const chatRef = ref(db, "chat");
    push(chatRef, { user: username, text, image });
  };

  const commandSystemRef = createCommandSystem(playerData, setPlayerData);

  return {
    messages,
    playerData,
    setPlayerData,
    broadcast,
    commandSystemRef
  };
};
