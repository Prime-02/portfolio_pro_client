import { create } from 'zustand'

interface ProjectsStore {
  projectsNames: string[]
  toggleProjectName: (name: string) => void
  addProjectName: (name: string) => void
  removeProjectName: (name: string) => void
  clearProjectsNames: () => void
}

export const useGitHubProjectsStore = create<ProjectsStore>((set, get) => ({
  projectsNames: [],
  
  toggleProjectName: (name: string) => {
    set((state) => {
      const exists = state.projectsNames.includes(name)
      
      if (exists) {
        return {
          projectsNames: state.projectsNames.filter(project => project !== name)
        }
      } else {
        return {
          projectsNames: [...state.projectsNames, name]
        }
      }
    })
  },
  
  addProjectName: (name: string) => {
    set((state) => {
      if (!state.projectsNames.includes(name)) {
        return {
          projectsNames: [...state.projectsNames, name]
        }
      }
      return state // No change if already exists
    })
  },
  
  removeProjectName: (name: string) => {
    set((state) => ({
      projectsNames: state.projectsNames.filter(project => project !== name)
    }))
  },
  
  clearProjectsNames: () => {
    set({ projectsNames: [] })
  }
}))