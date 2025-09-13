// Prevent TypeScript from looking for implicit 'firebase' type library
// This shim stops TS from trying to find an implicit '@types/firebase' package
declare module 'firebase' {
  const firebase: any;
  export = firebase;
}

// The modern Firebase SDK provides its own types via the official packages