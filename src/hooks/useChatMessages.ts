
import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { ref, onChildAdded, push } from 'firebase/database';
import { Message } from '@/types/gameTypes';

export const useChatMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const chatRef = ref(db, "chat");
    const unsubscribe = onChildAdded(chatRef, (snapshot) => {
      const message = snapshot.val();
      // Ensure message text is a string
      const sanitizedMessage = {
        ...message,
        text: typeof message.text === 'string' ? message.text : String(message.text || '')
      };
      setMessages(prev => [...prev, sanitizedMessage]);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const broadcast = (username: string, text: string, image: string | null = null) => {
    const chatRef = ref(db, "chat");
    // Ensure text is a string before pushing to Firebase
    const sanitizedText = typeof text === 'string' ? text : String(text || '');
    push(chatRef, { user: username, text: sanitizedText, image });
  };

  return { messages, broadcast };
};
