
// Type declaration for Firebase
declare module 'firebase' {
  interface Firebase {
    database: () => {
      ref: (path: string) => {
        on: (event: string, callback: Function) => void;
        off: () => void;
        push: (data: any) => { key: string };
      }
    }
  }
  
  const firebase: Firebase;
  export default firebase;
}
