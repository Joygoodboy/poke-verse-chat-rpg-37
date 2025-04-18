
// This file adds type definitions for Firebase

declare namespace firebase {
  interface DatabaseReference {
    key: string | null;
    parent: DatabaseReference | null;
    root: DatabaseReference;
    child(path: string): DatabaseReference;
    push(value?: any, onComplete?: (error: Error | null) => void): DatabaseReference;
    set(value: any, onComplete?: (error: Error | null) => void): Promise<void>;
    update(values: object, onComplete?: (error: Error | null) => void): Promise<void>;
    remove(onComplete?: (error: Error | null) => void): Promise<void>;
    onValue(callback: (snapshot: DataSnapshot) => void, options?: object): () => void;
    onChildAdded(callback: (snapshot: DataSnapshot) => void, options?: object): () => void;
    onChildChanged(callback: (snapshot: DataSnapshot) => void, options?: object): () => void;
    onChildRemoved(callback: (snapshot: DataSnapshot) => void, options?: object): () => void;
    onChildMoved(callback: (snapshot: DataSnapshot) => void, options?: object): () => void;
    off(eventType?: string, callback?: Function, context?: object): void;
    once(eventType: string, callback?: (snapshot: DataSnapshot) => void): Promise<DataSnapshot>;
  }

  interface DataSnapshot {
    exists(): boolean;
    key: string | null;
    val(): any;
    child(path: string): DataSnapshot;
    forEach(callback: (childSnapshot: DataSnapshot) => boolean | void): boolean;
    hasChild(path: string): boolean;
    hasChildren(): boolean;
    numChildren(): number;
    ref: DatabaseReference;
  }
}
