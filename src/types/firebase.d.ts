
// Firebase type declarations to prevent TypeScript errors
declare module 'firebase/app' {
  export function initializeApp(config: any): any;
  export function getApp(name?: string): any;
  export function getApps(): any[];
}

declare module 'firebase/database' {
  export function getDatabase(app?: any): any;
  export function ref(db: any, path: string): any;
  export function set(ref: any, data: any): Promise<void>;
  export function get(ref: any): Promise<any>;
  export function push(ref: any, data: any): any;
  export function remove(ref: any): Promise<void>;
  export function update(ref: any, data: any): Promise<void>;
  export function onValue(ref: any, callback: (snapshot: any) => void): () => void;
  
  export interface DataSnapshot {
    exists(): boolean;
    val(): any;
    key: string | null;
  }
}

declare module 'firebase/auth' {
  export function getAuth(app?: any): any;
  export function signInWithEmailAndPassword(auth: any, email: string, password: string): Promise<any>;
  export function createUserWithEmailAndPassword(auth: any, email: string, password: string): Promise<any>;
  export function signOut(auth: any): Promise<void>;
}
