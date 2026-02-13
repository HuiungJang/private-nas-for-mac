import {apiClient} from '@/shared/api/axios';
import type {AuditLog} from '../model/types';

export const auditApi = {
  getAuditLogs: async (offset = 0, limit = 100): Promise<AuditLog[]> => {
    const response = await apiClient.get<AuditLog[]>('/admin/system/audit-logs', {
      params: {offset, limit},
    });
    return response.data;
  },
};
