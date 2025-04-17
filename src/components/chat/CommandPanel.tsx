
import React, { useRef } from 'react';
import { CommandButtons } from "@/components/chat/CommandButtons";
import {
  HelpCircle,
  Gamepad2,
  Wallet,
  DollarSign,
  Award,
  UserMinus,
  Shield,
  ZapIcon,
  Users,
  Gift,
  PackageIcon,
  ShoppingCart,
  Calculator,
  Zap,
  PlusCircle,
  LogOut,
  Trash2
} from "lucide-react";

interface CommandPanelProps {
  userIsAdmin: boolean;
  onCommandClick: (command: string) => void;
}

export const CommandPanel: React.FC<CommandPanelProps> = ({ userIsAdmin, onCommandClick }) => {
  const commandsContainerRef = useRef<HTMLDivElement>(null);
  
  const economyCommands = [
    { name: "wallet", icon: <Wallet size={18} /> },
    { name: "slot", icon: <DollarSign size={18} /> },
    { name: "daily", icon: <Gift size={18} /> },
    { name: "shop", icon: <ShoppingCart size={18} /> },
    { name: "lb", icon: <Award size={18} /> }
  ];

  const pokemonCommands = [
    { name: "spawn", icon: <Gamepad2 size={18} /> },
    { name: "catch", icon: <PlusCircle size={18} /> },
    { name: "party", icon: <Users size={18} /> },
    { name: "pc", icon: <Gamepad2 size={18} /> },
    { name: "rb", icon: <Zap size={18} /> }
  ];

  const adminCommands = userIsAdmin ? [
    { name: "ban", icon: <UserMinus size={18} /> },
    { name: "unban", icon: <UserMinus size={18} /> },
    { name: "clearchat", icon: <Trash2 size={18} /> },
    { name: "owner", icon: <Shield size={18} /> },
    { name: "mods", icon: <Shield size={18} /> }
  ] : [];
  
  return (
    <div 
      ref={commandsContainerRef}
      className="p-2 bg-blue-600/40 backdrop-blur-sm flex flex-wrap gap-2 overflow-x-auto"
    >
      <CommandButtons 
        title="Help" 
        commands={[]} 
        onCommandClick={onCommandClick}
        className="bg-indigo-700 hover:bg-indigo-800 text-white"
        icon={<HelpCircle size={18} />}
      />
      
      <CommandButtons 
        title="Spawn" 
        commands={[]}
        onCommandClick={onCommandClick}
        className="bg-green-700 hover:bg-green-800 text-white"
        icon={<Gamepad2 size={18} />}
      />
      
      <CommandButtons 
        title="Catch" 
        commands={[]}
        onCommandClick={() => onCommandClick("catch")}
        className="bg-red-600 hover:bg-red-700 text-white"
        icon={<PlusCircle size={18} />}
      />
      
      <CommandButtons 
        title="Rank" 
        commands={[]}
        onCommandClick={() => onCommandClick("lb")}
        className="bg-purple-700 hover:bg-purple-800 text-white"
        icon={<Award size={18} />}
      />
      
      <CommandButtons 
        title="Inventory" 
        commands={[]}
        onCommandClick={onCommandClick}
        className="bg-red-700 hover:bg-red-800 text-white"
        icon={<PackageIcon size={18} />}
      />
      
      <CommandButtons 
        title="Shop" 
        commands={[]}
        onCommandClick={onCommandClick}
        className="bg-blue-700 hover:bg-blue-800 text-white"
        icon={<ShoppingCart size={18} />}
      />
      
      <CommandButtons 
        title="Daily" 
        commands={[]}
        onCommandClick={onCommandClick}
        className="bg-amber-600 hover:bg-amber-700 text-white"
        icon={<Gift size={18} />}
      />
      
      <CommandButtons 
        title="Economy" 
        commands={economyCommands} 
        onCommandClick={onCommandClick}
        className="bg-green-700 hover:bg-green-800 text-white"
        icon={<Calculator size={18} />}
      />
      
      <CommandButtons 
        title="Pokémon" 
        commands={pokemonCommands} 
        onCommandClick={onCommandClick}
        className="bg-red-700 hover:bg-red-800 text-white"
        icon={<Gamepad2 size={18} />}
      />
      
      {userIsAdmin && (
        <CommandButtons 
          title="Admin" 
          commands={adminCommands} 
          onCommandClick={onCommandClick}
          className="bg-purple-800 hover:bg-purple-900 text-white"
          icon={<Shield size={18} />}
        />
      )}
      
      <CommandButtons 
        title="Logout" 
        commands={[]} 
        onCommandClick={() => onCommandClick("logout")}
        className="bg-red-800 hover:bg-red-900 text-white"
        icon={<LogOut size={18} />}
      />
    </div>
  );
};
