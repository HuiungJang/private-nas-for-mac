import {useQuery} from '@tanstack/react-query';
import {auditApi} from '../api/auditApi';
import type {AuditLog} from './types';

export const useAuditLogs = () => {
  return useQuery<AuditLog[]>({
    queryKey: ['audit-logs'],
    queryFn: auditApi.getAuditLogs,
  });
};
