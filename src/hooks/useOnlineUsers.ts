
import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { ref, onValue, onDisconnect, set, remove } from 'firebase/database';

export const useOnlineUsers = (username: string) => {
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    const onlineUsersRef = ref(db, "online");
    const myPresenceRef = ref(db, `online/${username}`);
    
    set(myPresenceRef, true);
    onDisconnect(myPresenceRef).remove();
    
    const unsubscribe = onValue(onlineUsersRef, (snapshot) => {
      if (snapshot.exists()) {
        const users = Object.keys(snapshot.val());
        setOnlineUsers(users);
      } else {
        setOnlineUsers([]);
      }
    });

    return () => {
      unsubscribe();
      remove(myPresenceRef);
    };
  }, [username]);

  return onlineUsers;
};
