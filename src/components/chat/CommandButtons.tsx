
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

interface CommandButtonsProps {
  title: string;
  commands: Array<{
    name: string;
    icon: React.ReactNode;
  }>;
  onCommandClick: (command: string) => void;
  className?: string;
}

export const CommandButtons: React.FC<CommandButtonsProps> = ({
  title,
  commands,
  onCommandClick,
  className = ""
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="relative">
      <Button 
        variant="secondary" 
        className={`flex items-center gap-1 text-white ${className}`}
        onClick={() => setExpanded(!expanded)}
      >
        {title}
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </Button>
      
      {expanded && (
        <div className="absolute top-full left-0 mt-1 bg-slate-800 rounded-md p-1 shadow-lg z-10 flex flex-col gap-1 min-w-[150px]">
          {commands.map((command) => (
            <Button
              key={command.name}
              variant="ghost"
              className="flex justify-start items-center gap-2 py-1 text-white hover:bg-slate-700"
              onClick={() => {
                onCommandClick(command.name);
                setExpanded(false);
              }}
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
