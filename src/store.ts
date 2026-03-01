import { create } from 'zustand';
import { SystemModel, BuildTask } from './types';

interface AppState {
  theme: 'light' | 'dark';
  name: string;
  docs: { name: string; content: string }[];
  model: SystemModel | null;
  tasks: BuildTask[];
  currentTaskIndex: number;
  isAnalyzing: boolean;
  isQuickScanning: boolean;
  isGlobalLoading: boolean;
  activeTab: 'docs' | 'model' | 'tasks' | 'standards';
  streamedRawText: string;

  // Actions
  setTheme: (theme: 'light' | 'dark') => void;
  setName: (name: string) => void;
  addDocs: (docs: { name: string; content: string }[]) => void;
  removeDoc: (index: number) => void;
  setModel: (model: SystemModel | null) => void;
  setTasks: (tasks: BuildTask[]) => void;
  setCurrentTaskIndex: (index: number) => void;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
  setIsQuickScanning: (isQuickScanning: boolean) => void;
  setIsGlobalLoading: (isGlobalLoading: boolean) => void;
  setActiveTab: (tab: 'docs' | 'model' | 'tasks' | 'standards') => void;
  setStreamedRawText: (text: string) => void;
  toggleTaskStatus: (index: number) => void;
  loadProject: () => Promise<void>;
  saveProject: () => void;
  customRules: any[];
  setCustomRules: (rules: any[]) => void;
}

let saveTimeout: ReturnType<typeof setTimeout>;

export const useAppStore = create<AppState>((set, get) => ({
  theme: (localStorage.getItem('guide-theme') as 'light' | 'dark') || 'light',
  name: 'New Project',
  docs: [],
  model: null,
  tasks: [],
  currentTaskIndex: 0,
  isAnalyzing: false,
  isQuickScanning: false,
  isGlobalLoading: false,
  activeTab: 'docs',
  streamedRawText: '',
  customRules: [],

  setTheme: (theme) => {
    localStorage.setItem('guide-theme', theme);
    set({ theme });
  },
  setName: (name) => {
    set({ name });
    get().saveProject();
  },
  addDocs: (newDocs) => {
    set((state) => ({ docs: [...state.docs, ...newDocs] }));
    get().saveProject();
  },
  removeDoc: (index) => {
    set((state) => ({ docs: state.docs.filter((_, i) => i !== index) }));
    get().saveProject();
  },
  setModel: (model) => {
    set({ model });
    get().saveProject();
  },
  setTasks: (tasks) => {
    set({ tasks });
    get().saveProject();
  },
  setCurrentTaskIndex: (currentTaskIndex) => {
    set({ currentTaskIndex });
    get().saveProject();
  },
  setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
  setIsQuickScanning: (isQuickScanning) => set({ isQuickScanning }),
  setIsGlobalLoading: (isGlobalLoading) => set({ isGlobalLoading }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setStreamedRawText: (streamedRawText) => set({ streamedRawText }),
  setCustomRules: (customRules) => {
    set({ customRules });
    get().saveProject();
  },
  toggleTaskStatus: (index) => {
    set((state) => {
      const newTasks = [...state.tasks];
      newTasks[index].status = newTasks[index].status === 'completed' ? 'pending' : 'completed';
      return { tasks: newTasks };
    });
    get().saveProject();
  },
  
  loadProject: async () => {
    try {
      const res = await fetch('/api/state');
      if (res.ok) {
        const data = await res.json();
        if (data) {
          set({
            name: data.name || 'New Project',
            docs: data.docs || [],
            model: data.model || null,
            tasks: data.tasks || [],
            currentTaskIndex: data.currentTaskIndex || 0,
            customRules: data.customRules || [],
          });
        }
      }
    } catch (err) {
      console.error("Failed to load project:", err);
    }
  },

  saveProject: () => {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(async () => {
      const state = get();
      try {
        await fetch('/api/state', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: state.name,
            docs: state.docs,
            model: state.model,
            tasks: state.tasks,
            currentTaskIndex: state.currentTaskIndex,
            customRules: state.customRules,
          }),
        });
      } catch (err) {
        console.error("Failed to save project:", err);
      }
    }, 1000); // 1 second debounce
  }
}));
