import {create} from 'zustand';
import {buildTaskLabel, type FileTaskPayload} from './taskEvents';

export type TaskStatus = 'running' | 'success' | 'failed';

export interface TaskItem {
  id: string;
  label: string;
  status: TaskStatus;
  startedAt: number;
  finishedAt?: number;
  errorMessage?: string;
  details?: string;
}

interface TaskCenterState {
  tasks: TaskItem[];
  startTask: (task: string | FileTaskPayload) => string;
  completeTask: (id: string) => void;
  failTask: (id: string, errorMessage?: string, details?: string) => void;
  clearFinished: () => void;
  dismissTask: (id: string) => void;
  retryTask: (id: string) => void;
}

export const useTaskCenterStore = create<TaskCenterState>((set) => ({
  tasks: [],
  startTask: (taskInput) => {
    const id = crypto.randomUUID();
    const label = typeof taskInput === 'string' ? taskInput : buildTaskLabel(taskInput);
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
  failTask: (id, errorMessage, details) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id
          ? {...task, status: 'failed', finishedAt: Date.now(), errorMessage, details}
          : task
      ),
    }));
  },
  clearFinished: () => {
    set((state) => ({tasks: state.tasks.filter((t) => t.status === 'running')}));
  },
  dismissTask: (id) => {
    set((state) => ({tasks: state.tasks.filter((task) => task.id !== id)}));
  },
  retryTask: (id) => {
    set((state) => ({
      tasks: state.tasks.map((task) => {
        if (task.id !== id) return task;
        if (task.status !== 'failed') return task;
        return {
          ...task,
          status: 'running',
          errorMessage: undefined,
          details: 'Manual retry requested. Re-run the same action from toolbar/context menu.',
          startedAt: Date.now(),
          finishedAt: undefined,
        };
      }),
    }));
  },
}));
