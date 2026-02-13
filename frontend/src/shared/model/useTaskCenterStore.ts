import {create} from 'zustand';

export type TaskStatus = 'running' | 'success' | 'failed';

export interface TaskItem {
  id: string;
  label: string;
  status: TaskStatus;
  startedAt: number;
  finishedAt?: number;
  errorMessage?: string;
}

interface TaskCenterState {
  tasks: TaskItem[];
  startTask: (label: string) => string;
  completeTask: (id: string) => void;
  failTask: (id: string, errorMessage?: string) => void;
  clearFinished: () => void;
}

export const useTaskCenterStore = create<TaskCenterState>((set) => ({
  tasks: [],
  startTask: (label) => {
    const id = crypto.randomUUID();
    const task: TaskItem = {id, label, status: 'running', startedAt: Date.now()};
    set((state) => ({
      tasks: [task, ...state.tasks].slice(0, 30),
    }));
    return id;
  },
  completeTask: (id) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? {...task, status: 'success', finishedAt: Date.now()} : task
      ),
    }));
  },
  failTask: (id, errorMessage) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? {...task, status: 'failed', finishedAt: Date.now(), errorMessage} : task
      ),
    }));
  },
  clearFinished: () => {
    set((state) => ({tasks: state.tasks.filter((t) => t.status === 'running')}));
  },
}));
