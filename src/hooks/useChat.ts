
import { usePlayerData } from './usePlayerData';
import { useChatMessages } from './useChatMessages';
import { useNavigate } from 'react-router-dom';

// Updated admin and owner lists with lowercase emails for case-insensitive comparison
export const OWNER_LIST = ["joyhostingbsite.com@gmail.com", "joyhoswebsite@gmail.com", "good", "Ash", "admin@pokemon.com", "owner@pokemon.com"];
export const ADMIN_LIST = ["Gary", "Professor Oak", "mod@pokemon.com", "moderator@pokemon.com"];

export const useChat = (username: string) => {
  const { playerData, setPlayerData, isLoading } = usePlayerData(username);
  const { messages, broadcast: broadcastMessage } = useChatMessages();
  const navigate = useNavigate();
  
  const logout = () => {
    localStorage.removeItem("loggedInUser");
    navigate("/login");
  };
  
  const broadcast = (text: string, image: string | null = null) => {
    broadcastMessage(username, text, image);
  };

  // Check if user is admin or owner
  const userIsAdmin = isAdminUser(username);
  const userIsOwner = isOwnerUser(username);

  return {
    messages,
    playerData,
    setPlayerData,
    broadcast,
    logout,
    isLoading,
    userIsAdmin,
    userIsOwner
  };
};

// Case-insensitive admin and owner checks
export const isAdminUser = (username: string): boolean => {
  if (!username) return false;
  
  const lowerUsername = username.toLowerCase();
  return OWNER_LIST.some(owner => owner.toLowerCase() === lowerUsername) || 
         ADMIN_LIST.some(admin => admin.toLowerCase() === lowerUsername);
};

export const isOwnerUser = (username: string): boolean => {
  if (!username) return false;
  
  const lowerUsername = username.toLowerCase();
  return OWNER_LIST.some(owner => owner.toLowerCase() === lowerUsername);
};
