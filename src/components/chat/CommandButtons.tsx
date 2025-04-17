
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, MessageSquare, Crown, Sword, Coins, HelpCircle } from "lucide-react";

interface CommandButtonProps {
  userIsAdmin: boolean;
  onCommandClick: (command: string) => void;
  disabled?: boolean;
}

export const CommandButtons: React.FC<CommandButtonProps> = ({
  userIsAdmin,
  onCommandClick,
  disabled = false
}) => {
  return (
    <>
      <CommandGroup 
        title="Help" 
        commands={[
          { name: "help", icon: <HelpCircle size={16} /> }
        ]}
        onCommandClick={onCommandClick}
        variant="outline"
        icon={<HelpCircle size={16} />}
        disabled={disabled}
      />
      
      <CommandGroup 
        title="Economy" 
        commands={[
          { name: "wallet", icon: <Coins size={16} /> },
          { name: "daily", icon: <Coins size={16} /> },
          { name: "bank", icon: <Coins size={16} /> },
          { name: "leaderboard", icon: <Crown size={16} /> }
        ]}
        onCommandClick={onCommandClick}
        variant="secondary"
        icon={<Coins size={16} />}
        disabled={disabled}
      />
      
      <CommandGroup 
        title="Pokémon" 
        commands={[
          { name: "spawn", icon: <MessageSquare size={16} /> },
          { name: "catch", icon: <MessageSquare size={16} /> },
          { name: "party", icon: <MessageSquare size={16} /> },
          { name: "pc", icon: <MessageSquare size={16} /> }
        ]}
        onCommandClick={onCommandClick}
        variant="secondary"
        icon={<MessageSquare size={16} />}
        disabled={disabled}
      />
      
      <CommandGroup 
        title="Battle" 
        commands={[
          { name: "pokemonchallenge", icon: <Sword size={16} /> },
          { name: "forfeit", icon: <Sword size={16} /> },
          { name: "pokemonstats", icon: <Sword size={16} /> }
        ]}
        onCommandClick={onCommandClick}
        variant="secondary"
        icon={<Sword size={16} />}
        disabled={disabled}
      />
      
      {userIsAdmin && (
        <CommandGroup 
          title="Admin" 
          commands={[
            { name: "clearchat", icon: <Crown size={16} /> },
            { name: "ban", icon: <Crown size={16} /> },
            { name: "unban", icon: <Crown size={16} /> },
            { name: "givecoins", icon: <Coins size={16} /> },
            { name: "givepokemon", icon: <MessageSquare size={16} /> },
            { name: "announce", icon: <Crown size={16} /> }
          ]}
          onCommandClick={onCommandClick}
          variant="default"
          icon={<Crown size={16} />}
          disabled={disabled}
        />
      )}
    </>
  );
};

interface CommandGroupProps {
  title: string;
  commands: Array<{
    name: string;
    icon: React.ReactNode;
  }>;
  onCommandClick: (command: string) => void;
  className?: string;
  variant?: "default" | "secondary" | "outline" | "primary";
  icon?: React.ReactNode;
  disabled?: boolean;
}

export const CommandGroup: React.FC<CommandGroupProps> = ({
  title,
  commands = [],
  onCommandClick,
  className = "",
  variant = "secondary",
  icon,
  disabled = false
}) => {
  const [expanded, setExpanded] = useState(false);

  // If it's a single button (no dropdown needed)
  if (!commands || commands.length === 0) {
    return (
      <Button 
        variant={variant} 
        className={`flex items-center gap-1 ${className}`}
        onClick={() => onCommandClick(title.toLowerCase())}
        disabled={disabled}
      >
        {icon && icon}
        {title}
      </Button>
    );
  }

  return (
    <div className="relative">
      <Button 
        variant={variant} 
        className={`flex items-center gap-1 ${className}`}
        onClick={() => setExpanded(!expanded)}
        disabled={disabled}
      >
        {icon && icon}
        {title}
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </Button>
      
      {expanded && (
        <div className="absolute top-full left-0 mt-1 bg-slate-800 rounded-md p-1 shadow-lg z-50 flex flex-col gap-1 min-w-[150px]">
          {commands.map((command) => (
            <Button
              key={command.name}
              variant="ghost"
              className="flex justify-start items-center gap-2 py-1 text-white hover:bg-slate-700"
              onClick={() => {
                onCommandClick(command.name);
                setExpanded(false);
              }}
              disabled={disabled}
            >
              {command.icon}
              <span className="capitalize">{command.name}</span>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};
