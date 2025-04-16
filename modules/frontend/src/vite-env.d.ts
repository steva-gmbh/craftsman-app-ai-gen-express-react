/// <reference types="vite/client" />

// Add global property to Window interface for Draft.js compatibility
interface Window {
  global: Window;
} 