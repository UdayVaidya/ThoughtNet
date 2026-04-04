import { create } from "zustand";

const useStore = create((set, get) => ({
  user: null,
  isAuthChecking: true,
  content: [],
  collections: [],
  stats: null,
  selectedTags: [],
  selectedType: "",
  searchQuery: "",

  setUser: (user) => set({ user }),
  setIsAuthChecking: (isAuthChecking) => set({ isAuthChecking }),

  setContent: (content) => set({ content }),
  setCollections: (collections) => set({ collections }),
  setStats: (stats) => set({ stats }),
  setSelectedTags: (tags) => set({ selectedTags: tags }),
  setSelectedType: (type) => set({ selectedType: type }),
  setSearchQuery: (q) => set({ searchQuery: q }),

  addContent: (item) => set(s => ({ content: [item, ...s.content] })),
  removeContent: (id) => set(s => ({ content: s.content.filter(c => c._id !== id) })),
  updateContent: (id, updates) => set(s => ({
    content: s.content.map(c => c._id === id ? { ...c, ...updates } : c)
  })),
}));

export default useStore;
