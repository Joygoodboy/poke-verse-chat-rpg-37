
import { usePlayerData } from './usePlayerData';
import { useChatMessages } from './useChatMessages';
import { useNavigate } from 'react-router-dom';

export const OWNER_LIST = ["joyhostingbsite.com@gmail.com", "joyhoswebsite@gmail.com", "good", "Ash", "admin@pokemon.com", "owner@pokemon.com"];
export const ADMIN_LIST = ["Gary", "Professor Oak", "mod@pokemon.com", "moderator@pokemon.com"];

export const useChat = (username: string) => {
  const { playerData, setPlayerData } = usePlayerData(username);
  const { messages, broadcast: broadcastMessage } = useChatMessages();
  const navigate = useNavigate();
  
  const logout = () => {
    localStorage.removeItem("loggedInUser");
    navigate("/login");
  };
  
  const broadcast = (text: string, image: string | null = null) => {
    broadcastMessage(username, text, image);
  };

  return {
    messages,
    playerData,
    setPlayerData,
    broadcast,
    logout
  };
};
