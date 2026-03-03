import { create, StateCreator } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { SystemModel, BuildTask } from './types';

// --- Types ---

interface ProjectState {
  name: string;
  docs: { name: string; content: string }[];
  model: SystemModel | null;
  tasks: BuildTask[];
  currentTaskIndex: number;
  customRules: any[];
}

interface ProjectActions {
  setName: (name: string) => void;
  addDocs: (docs: { name: string; content: string }[]) => void;
  removeDoc: (index: number) => void;
  setModel: (model: SystemModel | null) => void;
  setTasks: (tasks: BuildTask[]) => void;
  setCurrentTaskIndex: (index: number) => void;
  setCustomRules: (rules: any[]) => void;
  toggleTaskStatus: (index: number) => void;
  loadProject: () => Promise<void>;
  saveProject: () => void;
}

interface UIState {
  theme: 'light' | 'dark';
  isAnalyzing: boolean;
  isQuickScanning: boolean;
  isGlobalLoading: boolean;
  activeTab: 'docs' | 'model' | 'tasks' | 'standards';
  streamedRawText: string;
}

interface UIActions {
  setTheme: (theme: 'light' | 'dark') => void;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
  setIsQuickScanning: (isQuickScanning: boolean) => void;
  setIsGlobalLoading: (isGlobalLoading: boolean) => void;
  setActiveTab: (tab: 'docs' | 'model' | 'tasks' | 'standards') => void;
  setStreamedRawText: (text: string) => void;
}

export type AppState = ProjectState & ProjectActions & UIState & UIActions;

// --- Slices ---

const createProjectSlice: StateCreator<
  AppState,
  [['zustand/devtools', never], ['zustand/subscribeWithSelector', never], ['zustand/immer', never]],
  [],
  ProjectState & ProjectActions
> = (set, get) => ({
  name: 'New Project',
  docs: [],
  model: null,
  tasks: [],
  currentTaskIndex: 0,
  customRules: [],

  setName: (name) => {
    set((state) => { state.name = name; }, false, 'project/setName');
    get().saveProject();
  },
  addDocs: (newDocs) => {
    set((state) => { state.docs.push(...newDocs); }, false, 'project/addDocs');
    get().saveProject();
  },
  removeDoc: (index) => {
    set((state) => { state.docs.splice(index, 1); }, false, 'project/removeDoc');
    get().saveProject();
  },
  setModel: (model) => {
    set((state) => { state.model = model; }, false, 'project/setModel');
    get().saveProject();
  },
  setTasks: (tasks) => {
    set((state) => { state.tasks = tasks; }, false, 'project/setTasks');
    get().saveProject();
  },
  setCurrentTaskIndex: (index) => {
    set((state) => { state.currentTaskIndex = index; }, false, 'project/setCurrentTaskIndex');
    get().saveProject();
  },
  setCustomRules: (rules) => {
    set((state) => { state.customRules = rules; }, false, 'project/setCustomRules');
    get().saveProject();
  },
  toggleTaskStatus: (index) => {
    set((state) => {
      const task = state.tasks[index];
      if (task) {
        task.status = task.status === 'completed' ? 'pending' : 'completed';
      }
    }, false, 'project/toggleTaskStatus');
    get().saveProject();
  },

  loadProject: async () => {
    try {
      const res = await fetch('/api/state');
      if (res.ok) {
        const data = await res.json();
        if (data) {
          set((state) => {
            state.name = data.name || 'New Project';
            state.docs = data.docs || [];
            state.model = data.model || null;
            state.tasks = data.tasks || [];
            state.currentTaskIndex = data.currentTaskIndex || 0;
            state.customRules = data.customRules || [];
          }, false, 'project/loadProject');
        }
      }
    } catch (err) {
      console.error("Failed to load project:", err);
    }
  },

  saveProject: () => {
    // Debounce logic is handled outside or could be integrated here.
    // We'll keep the existing debounce logic for now.
    triggerSave(get());
  }
});

const createUISlice: StateCreator<
  AppState,
  [['zustand/devtools', never], ['zustand/subscribeWithSelector', never], ['zustand/immer', never]],
  [],
  UIState & UIActions
> = (set) => ({
  theme: (localStorage.getItem('guide-theme') as 'light' | 'dark') || 'light',
  isAnalyzing: false,
  isQuickScanning: false,
  isGlobalLoading: false,
  activeTab: 'docs',
  streamedRawText: '',

  setTheme: (theme) => {
    localStorage.setItem('guide-theme', theme);
    set((state) => { state.theme = theme; }, false, 'ui/setTheme');
  },
  setIsAnalyzing: (isAnalyzing) => set((state) => { state.isAnalyzing = isAnalyzing; }, false, 'ui/setIsAnalyzing'),
  setIsQuickScanning: (isQuickScanning) => set((state) => { state.isQuickScanning = isQuickScanning; }, false, 'ui/setIsQuickScanning'),
  setIsGlobalLoading: (isGlobalLoading) => set((state) => { state.isGlobalLoading = isGlobalLoading; }, false, 'ui/setIsGlobalLoading'),
  setActiveTab: (tab) => set((state) => { state.activeTab = tab; }, false, 'ui/setActiveTab'),
  setStreamedRawText: (text) => set((state) => { state.streamedRawText = text; }, false, 'ui/setStreamedRawText'),
});

// --- Store ---

export const useAppStore = create<AppState>()(
  devtools(
    subscribeWithSelector(
      immer((...a) => ({
        ...createProjectSlice(...a),
        ...createUISlice(...a),
      }))
    ),
    { name: 'GuideEngineStore' }
  )
);

// --- Persistence Helper ---

let saveTimeout: ReturnType<typeof setTimeout>;

const triggerSave = (state: AppState) => {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(async () => {
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
  }, 1000);
};

