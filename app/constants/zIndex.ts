// ✅ Z-INDEX MANAGEMENT SYSTEM
// Centralized z-index values to prevent conflicts

export const Z_INDEX = {
  // Background layers
  background: 0,
  backgroundImage: 1,
  gradient: 4900,

  // Main content
  content: 10,
  contentOverlay: 20,

  // Menu system
  menuTren: 5000,
  menuDuoi: 5000,
  menuButton: 11000,

  // Chat system
  chatDrawer: 5500,
  chatToast: 5600,

  // Modals & Overlays
  modalBackdrop: 9900,
  modal: 9999,

  // Floating elements
  adminTools: 5001,
  loginButton: 5002,

  // Utilities
  tooltip: 10000,
  notification: 10100,
} as const;

// Export type for TypeScript strict checks
export type ZIndexKey = keyof typeof Z_INDEX;
