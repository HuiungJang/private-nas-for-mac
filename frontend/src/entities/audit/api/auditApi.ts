import {apiClient} from '@/shared/api/axios';
import type {AuditLog} from '../model/types';

export const auditApi = {
  getAuditLogs: async (): Promise<AuditLog[]> => {
    const response = await apiClient.get<AuditLog[]>('/admin/system/audit-logs');
    return response.data;
  },
};
