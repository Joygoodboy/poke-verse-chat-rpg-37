
import React from 'react';
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ChatHeaderProps {
  username: string;
  isAdmin: boolean;
  isOwner: boolean;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ username, isAdmin, isOwner }) => {
  const navigate = useNavigate();
  
  return (
    <div className="bg-blue-600 p-3 text-white flex items-center">
      <Button 
        variant="ghost" 
        className="text-white mr-2 p-1"
        onClick={() => navigate("/")}
      >
        <ChevronLeft size={20} />
      </Button>
      <h1 className="text-xl font-bold">Pokémon RPG Chat</h1>
      {isAdmin && <span className="ml-2 text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full">Admin</span>}
      {isOwner && <span className="ml-2 text-xs bg-yellow-500 text-white px-2 py-0.5 rounded-full">Owner</span>}
    </div>
  );
};
