import { PlayerData } from '@/types/gameTypes';
import { Slug, SlugPlayerData, SlugBattle } from '@/types/slugterraTypes';
import { ref, push, onValue, update, remove } from 'firebase/database';
import { db } from '@/firebase';

// Extended player data interface to include slug data
interface ExtendedPlayerData extends PlayerData {
  slugData?: SlugPlayerData;
}

export const handleSlugChallengeCommand = (
  playerData: ExtendedPlayerData,
  setPlayerData: (data: ExtendedPlayerData) => void,
  broadcast: (text: string) => void,
  opponentName: string,
  username: string
) => {
  if (!playerData.slugData?.slugs.arsenal.length) {
    broadcast("You need slugs in your arsenal to battle! Use /slugspawn and /slugcatch first.");
    return;
  }

  if (!opponentName) {
    broadcast("Usage: /slugchallenge [username]");
    return;
  }

  // Create slug battle
  const battleRef = ref(db, "slugBattles");
  const newBattle: SlugBattle = {
    id: Date.now().toString(),
    challenger: username,
    opponent: opponentName,
    challengerSlug: playerData.slugData.slugs.arsenal[0], // Use first slug
    opponentSlug: {} as Slug, // Will be set when opponent accepts
    turn: username,
    isActive: false,
    turnCount: 0
  };

  push(battleRef, newBattle);
  broadcast(`🥊 You challenged ${opponentName} to a Slugterra duel!`);
};

export const handleSlugBattleCommand = (
  playerData: ExtendedPlayerData,
  setPlayerData: (data: ExtendedPlayerData) => void,
  broadcast: (text: string) => void,
  moveIndex: string,
  username: string
) => {
  // Implementation for slug battle moves
  if (!moveIndex) {
    broadcast("Usage: /slugbattle [move-number] (1-4)");
    return;
  }

  const index = parseInt(moveIndex) - 1;
  if (isNaN(index) || index < 0 || index > 3) {
    broadcast("Invalid move number! Use 1-4.");
    return;
  }

  // Check if player is in an active slug battle
  // This would need to check Firebase for active battles
  broadcast("🔥 Slug battle system coming soon! Use /slugarsenal to view your slugs.");
};

export const handleSlugTrainCommand = (
  playerData: ExtendedPlayerData,
  setPlayerData: (data: ExtendedPlayerData) => void,
  broadcast: (text: string) => void,
  slugIndex?: string
) => {
  if (!playerData.slugData?.slugs.arsenal.length) {
    broadcast("You don't have any slugs to train!");
    return;
  }

  const index = slugIndex ? parseInt(slugIndex) - 1 : 0;
  if (index < 0 || index >= playerData.slugData.slugs.arsenal.length) {
    broadcast("Invalid slug number! Use /slugarsenal to see your slugs.");
    return;
  }

  const slug = playerData.slugData.slugs.arsenal[index];
  
  // Training costs energy
  if (playerData.slugData.energy < 20) {
    broadcast("Not enough energy to train! You need 20 energy points.");
    return;
  }

  // Gain XP and possibly level up
  const xpGained = Math.floor(Math.random() * 30) + 10;
  const updatedSlug = { ...slug };
  updatedSlug.xp += xpGained;

  // Check for level up
  if (updatedSlug.xp >= updatedSlug.maxXp) {
    updatedSlug.level += 1;
    updatedSlug.xp = updatedSlug.xp - updatedSlug.maxXp;
    updatedSlug.maxXp = updatedSlug.level * 100;
    
    // Increase stats
    updatedSlug.maxHp += Math.floor(Math.random() * 10) + 5;
    updatedSlug.hp = updatedSlug.maxHp;
    updatedSlug.attack += Math.floor(Math.random() * 3) + 1;
    updatedSlug.defense += Math.floor(Math.random() * 3) + 1;
    updatedSlug.speed += Math.floor(Math.random() * 3) + 1;

    broadcast(`🎉 ${slug.name} leveled up to level ${updatedSlug.level}! Stats increased!`);
  }

  // Update player data
  const updatedPlayerData = { ...playerData };
  updatedPlayerData.slugData!.slugs.arsenal[index] = updatedSlug;
  updatedPlayerData.slugData!.energy -= 20;

  setPlayerData(updatedPlayerData);
  broadcast(`💪 ${slug.name} gained ${xpGained} XP from training! Energy: ${updatedPlayerData.slugData!.energy}/100`);
};

export const handleSlugFuseCommand = (
  playerData: ExtendedPlayerData,
  setPlayerData: (data: ExtendedPlayerData) => void,
  broadcast: (text: string) => void,
  slug1Index?: string,
  slug2Index?: string
) => {
  if (!playerData.slugData?.slugs.arsenal.length || playerData.slugData.slugs.arsenal.length < 2) {
    broadcast("You need at least 2 slugs to fuse!");
    return;
  }

  if (!slug1Index || !slug2Index) {
    broadcast("Usage: /slugfuse [slug1-number] [slug2-number]");
    return;
  }

  const index1 = parseInt(slug1Index) - 1;
  const index2 = parseInt(slug2Index) - 1;

  if (index1 < 0 || index1 >= playerData.slugData.slugs.arsenal.length ||
      index2 < 0 || index2 >= playerData.slugData.slugs.arsenal.length ||
      index1 === index2) {
    broadcast("Invalid slug numbers! Use /slugarsenal to see your slugs.");
    return;
  }

  const slug1 = playerData.slugData.slugs.arsenal[index1];
  const slug2 = playerData.slugData.slugs.arsenal[index2];

  // Check if slugs can fuse (same element or special conditions)
  if (slug1.element !== slug2.element) {
    broadcast("Slugs must be of the same element to fuse!");
    return;
  }

  // Fusion costs slug coins
  const fusionCost = 100;
  if (playerData.slugData.slugCoins < fusionCost) {
    broadcast(`Fusion costs ${fusionCost} slug coins! You have ${playerData.slugData.slugCoins}.`);
    return;
  }

  // Create fused slug
  const fusedSlug: Slug = {
    name: `${slug1.name}-${slug2.name}`,
    image: slug1.image, // Use first slug's image for now
    element: slug1.element,
    rarity: slug1.rarity === 'legendary' || slug2.rarity === 'legendary' ? 'legendary' : 
            slug1.rarity === 'ultra-rare' || slug2.rarity === 'ultra-rare' ? 'ultra-rare' : 'rare',
    level: Math.max(slug1.level, slug2.level),
    xp: 0,
    maxXp: Math.max(slug1.level, slug2.level) * 100,
    moves: [...slug1.moves.slice(0, 2), ...slug2.moves.slice(0, 2)],
    hp: Math.max(slug1.maxHp, slug2.maxHp) + 20,
    maxHp: Math.max(slug1.maxHp, slug2.maxHp) + 20,
    attack: slug1.attack + slug2.attack,
    defense: slug1.defense + slug2.defense,
    speed: slug1.speed + slug2.speed,
    fusionPower: (slug1.fusionPower || 0) + (slug2.fusionPower || 0) + 50
  };

  // Update player data - remove original slugs and add fused slug
  const updatedPlayerData = { ...playerData };
  updatedPlayerData.slugData!.slugs.arsenal = updatedPlayerData.slugData!.slugs.arsenal
    .filter((_, i) => i !== index1 && i !== index2);
  updatedPlayerData.slugData!.slugs.arsenal.push(fusedSlug);
  updatedPlayerData.slugData!.slugCoins -= fusionCost;

  setPlayerData(updatedPlayerData);
  broadcast(`🔥 Successfully fused ${slug1.name} and ${slug2.name} into ${fusedSlug.name}! Fusion Power: ${fusedSlug.fusionPower}`);
};