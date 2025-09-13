import { PlayerData } from '@/types/gameTypes';
import { Slug, SlugPlayerData } from '@/types/slugterraTypes';
import { getRandomSlug, createSlugInstance, getAllSlugs } from '@/utils/slugterraData';

// Extended player data interface to include slug data
interface ExtendedPlayerData extends PlayerData {
  slugData?: SlugPlayerData;
}

export const handleSlugSpawnCommand = (
  playerData: ExtendedPlayerData,
  setPlayerData: (data: ExtendedPlayerData) => void,
  broadcast: (text: string, image?: string | null) => void
) => {
  try {
    // Initialize slug data if it doesn't exist
    if (!playerData.slugData) {
      playerData.slugData = {
        slugs: {
          arsenal: [],
          hideout: []
        },
        lastSlugSpawn: null,
        slugCoins: 100, // Starting coins
        tournaments: {
          wins: 0,
          losses: 0,
          ranking: 1000
        },
        energy: 100,
        maxEnergy: 100,
        lastEnergyRefill: null
      };
    }

    // Get random slug (10% chance for ghoul)
    const includeGhouls = Math.random() < 0.1;
    const slugKey = getRandomSlug(includeGhouls);
    const level = Math.floor(Math.random() * 3) + 1; // Level 1-3
    
    const slug = createSlugInstance(slugKey, level);
    
    // Update player data
    const updatedPlayerData = { 
      ...playerData,
      slugData: {
        ...playerData.slugData,
        lastSlugSpawn: slug
      }
    };
    
    setPlayerData(updatedPlayerData);
    
    const slugType = slug.isGhoul ? 'ghoul slug' : 'slug';
    broadcast(
      `🌟 A wild ${slug.name} (${slugType}) appeared! Element: ${slug.element} | Level: ${slug.level} | Rarity: ${slug.rarity}`,
      slug.image
    );
    
  } catch (error) {
    console.error("Error spawning slug:", error);
    broadcast("Error spawning slug. Please try again.");
  }
};

export const handleSlugCatchCommand = (
  playerData: ExtendedPlayerData,
  setPlayerData: (data: ExtendedPlayerData) => void,
  broadcast: (text: string) => void
) => {
  if (!playerData.slugData?.lastSlugSpawn) {
    broadcast("No slug to catch! Use /slugspawn first.");
    return;
  }

  // Initialize slug data if needed
  if (!playerData.slugData) {
    broadcast("No slug data found. Use /slugspawn first.");
    return;
  }

  const slug = playerData.slugData.lastSlugSpawn;
  
  // Calculate catch rate based on rarity
  const catchRates: Record<string, number> = {
    'common': 0.8,
    'uncommon': 0.65,
    'rare': 0.5,
    'ultra-rare': 0.3,
    'legendary': 0.15
  };
  
  const baseRate = catchRates[slug.rarity] || 0.5;
  const success = Math.random() < baseRate;
  
  const updatedPlayerData = { ...playerData };
  
  if (success) {
    // Add to arsenal if space, otherwise to hideout
    if (updatedPlayerData.slugData.slugs.arsenal.length < 5) {
      updatedPlayerData.slugData.slugs.arsenal.push(slug);
      broadcast(`✅ You caught ${slug.name}! Added to your arsenal.`);
    } else {
      updatedPlayerData.slugData.slugs.hideout.push(slug);
      broadcast(`✅ Arsenal full! ${slug.name} was sent to your hideout.`);
    }
    
    // Award slug coins based on rarity
    const coinReward = {
      'common': 10,
      'uncommon': 20,
      'rare': 35,
      'ultra-rare': 50,
      'legendary': 100
    }[slug.rarity] || 10;
    
    updatedPlayerData.slugData.slugCoins += coinReward;
    broadcast(`💰 You earned ${coinReward} slug coins!`);
    
  } else {
    broadcast(`❌ Oh no! ${slug.name} escaped and disappeared into the caverns!`);
  }
  
  // Clear the last spawn
  updatedPlayerData.slugData.lastSlugSpawn = null;
  setPlayerData(updatedPlayerData);
};

export const handleSlugArsenalCommand = (
  playerData: ExtendedPlayerData,
  broadcast: (text: string) => void
) => {
  if (!playerData.slugData?.slugs.arsenal.length) {
    broadcast("Your arsenal is empty! Use /slugspawn and /slugcatch to collect slugs.");
    return;
  }

  let arsenalText = "🔫 **YOUR ARSENAL:**\n";
  playerData.slugData.slugs.arsenal.forEach((slug, index) => {
    const statusIcon = slug.isGhoul ? '👻' : '⭐';
    arsenalText += `${index + 1}. ${statusIcon} ${slug.name} (Lv.${slug.level}) - ${slug.element} | HP: ${slug.hp}/${slug.maxHp}\n`;
  });
  
  arsenalText += `\n💰 Slug Coins: ${playerData.slugData.slugCoins}`;
  broadcast(arsenalText);
};

export const handleSlugHideoutCommand = (
  playerData: ExtendedPlayerData,
  broadcast: (text: string) => void
) => {
  if (!playerData.slugData?.slugs.hideout.length) {
    broadcast("Your hideout is empty!");
    return;
  }

  let hideoutText = "🏠 **YOUR HIDEOUT:**\n";
  playerData.slugData.slugs.hideout.forEach((slug, index) => {
    const statusIcon = slug.isGhoul ? '👻' : '⭐';
    hideoutText += `${index + 1}. ${statusIcon} ${slug.name} (Lv.${slug.level}) - ${slug.element}\n`;
  });
  
  broadcast(hideoutText);
};

export const handleSlugInfoCommand = (
  playerData: ExtendedPlayerData,
  broadcast: (text: string) => void,
  slugIndex?: string
) => {
  if (!playerData.slugData?.slugs.arsenal.length) {
    broadcast("Your arsenal is empty!");
    return;
  }

  const index = slugIndex ? parseInt(slugIndex) - 1 : 0;
  if (index < 0 || index >= playerData.slugData.slugs.arsenal.length) {
    broadcast("Invalid slug number! Use /slugarsenal to see your slugs.");
    return;
  }

  const slug = playerData.slugData.slugs.arsenal[index];
  const statusIcon = slug.isGhoul ? '👻' : '⭐';
  
  let infoText = `${statusIcon} **${slug.name.toUpperCase()}**\n`;
  infoText += `Element: ${slug.element} | Rarity: ${slug.rarity}\n`;
  infoText += `Level: ${slug.level} | XP: ${slug.xp}/${slug.maxXp}\n`;
  infoText += `HP: ${slug.hp}/${slug.maxHp} | ATK: ${slug.attack} | DEF: ${slug.defense} | SPD: ${slug.speed}\n`;
  infoText += `\n🎯 **MOVES:**\n`;
  
  slug.moves.forEach((move, idx) => {
    infoText += `${idx + 1}. ${move.name} (${move.damage} damage) - ${move.description}\n`;
  });
  
  broadcast(infoText);
};