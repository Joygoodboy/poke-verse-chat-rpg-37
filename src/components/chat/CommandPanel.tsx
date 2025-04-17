
import React from 'react';
import { CommandButtons } from './CommandButtons';

interface CommandPanelProps {
  userIsAdmin: boolean;
  onCommandClick: (command: string) => void;
  isLoading?: boolean;
}

export const CommandPanel: React.FC<CommandPanelProps> = ({ 
  userIsAdmin, 
  onCommandClick,
  isLoading = false
}) => {
  return (
    <div className="py-2 px-4 bg-blue-600/50 backdrop-blur-sm">
      <div className="flex flex-wrap gap-1 justify-center">
        <CommandButtons 
          userIsAdmin={userIsAdmin} 
          onCommandClick={onCommandClick}
          disabled={isLoading}
        />
      </div>
    </div>
  );
};
