
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAv3MYHvWqTFXW65ydkn_29MeVy7bHPrhU",
  authDomain: "pokemonrpg2-49db1.firebaseapp.com",
  projectId: "pokemonrpg2-49db1",
  databaseURL: "https://pokemonrpg2-49db1-default-rtdb.firebaseio.com",
  storageBucket: "pokemonrpg2-49db1.appspot.com",
  messagingSenderId: "571501991226",
  appId: "1:571501991226:web:b22243bebe6e532bc12c03",
  measurementId: "G-VB97LQB3MC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);
export const auth = getAuth(app);

export default app;
