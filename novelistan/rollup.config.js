// rollup.config.js
export default {
  // Explicitly disable use of native extensions
  experimentalLogSideEffects: false,
  
  // Force use of JS implementation instead of native
  treeshake: {
    moduleSideEffects: false,
    propertyReadSideEffects: false,
    tryCatchDeoptimization: false
  },
  
  // Set output format to ES modules
  output: {
    format: 'es',
    sourcemap: true
  },
  
  // Disable native dependencies
  context: 'globalThis',
  
  // Other options to improve compatibility
  preserveEntrySignatures: false,
  
  // Skip loading native bindings
  experimentalCacheExpiry: 0
};
