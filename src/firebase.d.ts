
// Type definitions for Firebase Web SDK
declare module 'firebase/app' {
  export interface FirebaseOptions {
    apiKey?: string;
    authDomain?: string;
    databaseURL?: string;
    projectId?: string;
    storageBucket?: string;
    messagingSenderId?: string;
    appId?: string;
    measurementId?: string;
  }

  export interface FirebaseApp {
    name: string;
    options: FirebaseOptions;
    automaticDataCollectionEnabled: boolean;
  }

  export function initializeApp(options: FirebaseOptions, name?: string): FirebaseApp;
  export function getApp(name?: string): FirebaseApp;
}

declare module 'firebase/database' {
  export interface Database {
    app: import('firebase/app').FirebaseApp;
  }

  export function getDatabase(app?: import('firebase/app').FirebaseApp, url?: string): Database;
  export function ref(db: Database, path?: string): Reference;
  export function push(reference: Reference, value?: any): Reference;
  export function set(reference: Reference, value: any): Promise<void>;
  export function update(reference: Reference, value: any): Promise<void>;
  export function remove(reference: Reference): Promise<void>;
  export function onValue(reference: Reference, callback: (snapshot: DataSnapshot) => void): () => void;
  export function get(reference: Reference): Promise<DataSnapshot>;

  export interface DataSnapshot {
    key: string | null;
    val(): any;
    exists(): boolean;
  }

  export interface Reference {
    key: string | null;
    parent: Reference | null;
    root: Reference;
  }
}

declare module 'firebase/auth' {
  export interface Auth {
    app: import('firebase/app').FirebaseApp;
  }

  export function getAuth(app?: import('firebase/app').FirebaseApp): Auth;
  export function createUserWithEmailAndPassword(auth: Auth, email: string, password: string): Promise<UserCredential>;
  export function signInWithEmailAndPassword(auth: Auth, email: string, password: string): Promise<UserCredential>;
  export function signOut(auth: Auth): Promise<void>;
  export function onAuthStateChanged(auth: Auth, callback: (user: User | null) => void): () => void;

  export interface User {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
  }

  export interface UserCredential {
    user: User;
  }
}
