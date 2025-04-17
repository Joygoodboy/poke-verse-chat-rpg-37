
import { PlayerData } from '@/types/gameTypes';
import { ref, get } from 'firebase/database';
import { db } from '../../firebase';

export const handleLeaderboardCommand = async (broadcast: (text: string) => void) => {
  const playersRef = ref(db, "players");
  const snapshot = await get(playersRef);
  
  if (!snapshot.exists()) {
    broadcast("No players found for leaderboard yet.");
    return;
  }

  const allPlayers = snapshot.val();
  const playerWealthList = Object.entries(allPlayers).map(([name, data]: [string, any]) => ({
    name,
    totalWealth: (data.wallet || 0) + (data.bank || 0)
  }));

  playerWealthList.sort((a, b) => b.totalWealth - a.totalWealth);

  let leaderboardText = "🏆 **Richest Players Leaderboard** 🏆\n\n";
  playerWealthList.slice(0, 10).forEach((player, index) => {
    const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}.`;
    leaderboardText += `${medal} ${player.name}: ${player.totalWealth} coins\n`;
  });

  broadcast(leaderboardText);
};
