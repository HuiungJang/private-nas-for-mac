import {create} from 'zustand';

export type Severity = 'success' | 'info' | 'warning' | 'error';

interface NotificationState {
  open: boolean;
  message: string;
  severity: Severity;
  showNotification: (message: string, severity?: Severity) => void;
  hideNotification: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  open: false,
  message: '',
  severity: 'info',
  showNotification: (message, severity = 'info') => set({open: true, message, severity}),
  hideNotification: () => set({open: false}),
}));
