
declare module 'firebase/app' {
  export interface FirebaseApp {
    name: string;
    options: Record<string, any>;
  }
  
  export function initializeApp(options: Record<string, any>, name?: string): FirebaseApp;
}

declare module 'firebase/database' {
  import { FirebaseApp } from 'firebase/app';
  
  export function getDatabase(app?: FirebaseApp): any;
  export function ref(db: any, path?: string): any;
  export function set(ref: any, value: any): Promise<void>;
  export function push(ref: any, value: any): any;
  export function get(ref: any): Promise<any>;
  export function onValue(ref: any, callback: (snapshot: any) => void): () => void;
  export function onChildAdded(ref: any, callback: (snapshot: any) => void): () => void;
  export function remove(ref: any): Promise<void>;
  
  export interface DataSnapshot {
    exists(): boolean;
    val(): any;
    key: string | null;
  }
}

declare module 'firebase/auth' {
  import { FirebaseApp } from 'firebase/app';
  
  export function getAuth(app?: FirebaseApp): any;
  export function createUserWithEmailAndPassword(auth: any, email: string, password: string): Promise<any>;
  export function signInWithEmailAndPassword(auth: any, email: string, password: string): Promise<any>;
  export function signOut(auth: any): Promise<void>;
}
