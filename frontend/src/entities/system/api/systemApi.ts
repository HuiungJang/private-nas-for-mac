import {apiClient} from '@/shared/api/axios';
import type {SystemHealth} from '../model/types';

export const systemApi = {
  getHealth: async (): Promise<SystemHealth> => {
    const response = await apiClient.get<SystemHealth>('/admin/system/health');
    return response.data;
  },
};
