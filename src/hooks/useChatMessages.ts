
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
      setMessages(prev => [...prev, message]);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const broadcast = (username: string, text: string, image: string | null = null) => {
    const chatRef = ref(db, "chat");
    push(chatRef, { user: username, text, image });
  };

  return { messages, broadcast };
};
