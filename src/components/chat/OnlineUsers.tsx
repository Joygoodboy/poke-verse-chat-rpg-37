
import React from 'react';
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

interface OnlineUsersProps {
  users: string[];
  username: string;
  isOwner: boolean;
  onBanUser: (user: string) => void;
}

export const OnlineUsers: React.FC<OnlineUsersProps> = ({ users, username, isOwner, onBanUser }) => {
  return (
    <div className="hidden md:block w-64 bg-blue-200/30 backdrop-blur-sm p-4 border-r border-blue-300">
      <h2 className="text-white font-bold mb-4 flex items-center">
        <Users className="mr-2" size={18} /> Online Trainers
        <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">{users.length} online</span>
      </h2>
      {users.length > 0 ? (
        <div className="space-y-2">
          {users.map((user, index) => (
            <div key={index} className="flex items-center text-white">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span>{user}</span>
              {isOwner && user !== username && (
                <button 
                  onClick={() => onBanUser(user)} 
                  className="ml-2 text-xs text-red-300 hover:text-red-100"
                  title="Ban user"
                >
                  Ban
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-white/70 italic">
          No trainers online
        </div>
      )}
    </div>
  );
};
