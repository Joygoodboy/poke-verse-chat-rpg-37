
import firebase from "firebase/compat/app";
import "firebase/compat/database";
import "firebase/compat/auth";

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

// Initialize Firebase if it hasn't been initialized yet
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const db = firebase.database();
export const auth = firebase.auth();

export default firebase;
