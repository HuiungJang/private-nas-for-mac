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
  onRetry?: () => Promise<void> | void;
}

type TaskStartInput = string | FileTaskPayload | {
  task: string | FileTaskPayload;
  onRetry?: () => Promise<void> | void;
};

interface TaskCenterState {
  tasks: TaskItem[];
  startTask: (task: TaskStartInput) => string;
  completeTask: (id: string) => void;
  failTask: (id: string, errorMessage?: string, details?: string) => void;
  clearFinished: () => void;
  dismissTask: (id: string) => void;
  retryTask: (id: string) => Promise<void>;
}

export const useTaskCenterStore = create<TaskCenterState>((set, get) => ({
  tasks: [],
  startTask: (taskInput) => {
    const id = crypto.randomUUID();

    const normalized =
      typeof taskInput === 'object' && taskInput !== null && 'task' in taskInput
        ? taskInput
        : {task: taskInput};

    const label =
      typeof normalized.task === 'string'
        ? normalized.task
        : buildTaskLabel(normalized.task);

    const task: TaskItem = {
      id,
      label,
      status: 'running',
      startedAt: Date.now(),
      onRetry: normalized.onRetry,
    };

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
  retryTask: async (id) => {
    const current = get().tasks.find((task) => task.id === id);
    if (!current || current.status !== 'failed' || !current.onRetry) {
      return;
    }

    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id
          ? {
              ...task,
              status: 'running',
              errorMessage: undefined,
              details: undefined,
              startedAt: Date.now(),
              finishedAt: undefined,
            }
          : task
      ),
    }));

    try {
      await current.onRetry();
      get().completeTask(id);
    } catch (error: any) {
      get().failTask(id, error?.message || 'Retry failed');
    }
  },
}));
