import { create } from "zustand";
import { Id } from "../../../../convex/_generated/dataModel";

interface TabState {
  openTabs: Id<"files">[];
  activeTabId: Id<"files"> | null;
  previewTabId: Id<"files"> | null;
}

const defaultTabState: TabState = {
  openTabs: [],
  activeTabId: null,
  previewTabId: null,
};

interface EditorStore {
  tabs: Map<Id<"projects">, TabState>;

  getTabState: (projectId: Id<"projects">) => TabState;
  openFile: (
    projectId: Id<"projects">,
    fileId: Id<"files">,
    options: { pinned?: boolean }
  ) => void;
  closeTab: (projectId: Id<"projects">, fileId: Id<"files">) => void;
  closeAllTabs: (projectId: Id<"projects">) => void;
  setActiveTab: (projectId: Id<"projects">, fileId: Id<"files">) => void;
}

const useEditorStore = create<EditorStore>()((set, get) => ({
  tabs: new Map(),
  getTabState: (projectId) => {
    return get().tabs.get(projectId) || defaultTabState;
  },
  openFile: (projectId, fileId, { pinned }) => {
    const tabs = new Map(get().tabs);
    const state = tabs.get(projectId) || defaultTabState;
    const { openTabs, previewTabId } = state;
    const isOpen = openTabs.includes(fileId);
    // case1: openning as a preview
    if (!isOpen && !pinned) {
      const newTabs = previewTabId
        ? openTabs.map((id) => (id === previewTabId ? fileId : id))
        : [...openTabs, fileId];

      tabs.set(projectId, {
        ...state,
        previewTabId: fileId,
        activeTabId: fileId,
        openTabs: newTabs,
      });
      set({ tabs });
      return;
    }
    // case2: opening as pinned - add new Tab
    if (!isOpen && pinned) {
      tabs.set(projectId, {
        ...state,
        openTabs: [...openTabs, fileId],
        activeTabId: fileId,
      });
      set({ tabs });
      return;
    }
    // case3: file already opened - just activate it (adn pin it if double-click)
    const shouldPin = pinned || previewTabId === fileId;
    tabs.set(projectId, {
      ...state,
      activeTabId: fileId,
      previewTabId: shouldPin ? null : previewTabId,
    });
    set({ tabs });
  },
  closeTab: (projectId, fileId) => {
    const tabs = new Map(get().tabs);
    const state = tabs.get(projectId) || defaultTabState;
    const { openTabs, activeTabId, previewTabId } = state;
    const tabIndex = openTabs.indexOf(fileId);
    if (tabIndex < 0) return;

    const newTabs = openTabs.filter((id) => id !== fileId);
    let newActiveTabId = activeTabId;
    // close the active tab
    if (activeTabId === fileId) {
      if (newTabs.length === 0) {
        newActiveTabId = null;
      } else if (tabIndex >= newTabs.length) {
        newActiveTabId = newTabs[newTabs.length - 1];
      } else {
        newActiveTabId = newTabs[tabIndex];
      }
    }

    tabs.set(projectId, {
      ...state,
      openTabs: newTabs,
      activeTabId: newActiveTabId,
      previewTabId: previewTabId === fileId ? null : previewTabId,
    });
    set({ tabs });
  },

  closeAllTabs: (projectId) => {
    const tabs = new Map(get().tabs);
    tabs.set(projectId, defaultTabState);
    set({ tabs });
  },
  setActiveTab: (projectId, fileId) => {
    const tabs = new Map(get().tabs);
    const state = tabs.get(projectId) || defaultTabState;
    if (fileId === state.activeTabId) return;
    tabs.set(projectId, {
      ...state,
      activeTabId: fileId,
    });
    set({ tabs });
  },
}));

export default useEditorStore;
