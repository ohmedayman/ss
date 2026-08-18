import { create } from 'zustand';
import { Screen, Playlist, ScreenTemplate, MediaItem, User, Organization } from './types';

interface AppState {
  // Auth
  user: User | null;
  organization: Organization | null;
  setUser: (user: User | null) => void;
  setOrganization: (org: Organization | null) => void;

  // Screens
  screens: Screen[];
  setScreens: (screens: Screen[]) => void;
  updateScreen: (id: string, updates: Partial<Screen>) => void;

  // Media
  media: MediaItem[];
  setMedia: (media: MediaItem[]) => void;
  addMedia: (item: MediaItem) => void;
  removeMedia: (id: string) => void;

  // Playlists
  playlists: Playlist[];
  setPlaylists: (playlists: Playlist[]) => void;

  // Templates
  templates: ScreenTemplate[];
  setTemplates: (templates: ScreenTemplate[]) => void;

  // Queue
  queueServices: any[];
  queueTickets: any[];
  setQueueServices: (services: any[]) => void;
  setQueueTickets: (tickets: any[]) => void;

  // UI State
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  activeModal: string | null;
  setActiveModal: (modal: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Auth
  user: null,
  organization: null,
  setUser: (user) => set({ user }),
  setOrganization: (organization) => set({ organization }),

  // Screens
  screens: [],
  setScreens: (screens) => set({ screens }),
  updateScreen: (id, updates) =>
    set((state) => ({
      screens: state.screens.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    })),

  // Media
  media: [],
  setMedia: (media) => set({ media }),
  addMedia: (item) => set((state) => ({ media: [...state.media, item] })),
  removeMedia: (id) => set((state) => ({ media: state.media.filter((m) => m.id !== id) })),

  // Playlists
  playlists: [],
  setPlaylists: (playlists) => set({ playlists }),

  // Templates
  templates: [],
  setTemplates: (templates) => set({ templates }),

  // Queue
  queueServices: [],
  queueTickets: [],
  setQueueServices: (queueServices) => set({ queueServices }),
  setQueueTickets: (queueTickets) => set({ queueTickets }),

  // UI State
  sidebarOpen: false,
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  activeModal: null,
  setActiveModal: (activeModal) => set({ activeModal }),
}));
