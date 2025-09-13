
import React, { useRef, useEffect } from 'react';
import { Message } from "@/types/gameTypes";

interface ChatMessagesProps {
  messages: Message[];
  username: string;
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({ messages, username }) => {
  const chatDivRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatDivRef.current) {
      chatDivRef.current.scrollTop = chatDivRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div 
      ref={chatDivRef}
      className="flex-1 overflow-y-auto p-4 bg-white/10 backdrop-blur-sm"
    >
      {messages.map((msg, index) => {
        // Check if the message text is a string before using includes
        const messageText = typeof msg.text === 'string' ? msg.text : '';
        const isBroadcast = messageText.includes("[BROADCAST]");
        
        return (
          <div 
            key={index} 
            className={`max-w-[80%] my-2 p-3 rounded-lg clear-both ${
              msg.user === username 
                ? "bg-blue-500/80 text-white float-right text-right" 
                : msg.user === "System"
                  ? "bg-purple-500/80 text-white mx-auto clear-both text-center"
                  : isBroadcast
                    ? "bg-yellow-500/80 text-white w-full clear-both text-center"
                    : "bg-white/80 float-left text-left"
            }`}
          >
            <div><strong>{msg.user}:</strong> <span dangerouslySetInnerHTML={{ __html: messageText }} /></div>
            {msg.image && <img src={msg.image} alt="Pokemon" className="max-w-[100px] mt-2" />}
          </div>
        );
      })}
    </div>
  );
};
