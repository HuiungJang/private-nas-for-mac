import {useQuery} from '@tanstack/react-query';
import {auditApi} from '../api/auditApi';
import type {AuditLog} from './types';
import {queryKeys} from '@/shared/model/queryKeys';

export const useAuditLogs = (offset = 0, limit = 100) => {
  return useQuery<AuditLog[]>({
    queryKey: queryKeys.auditLogs(offset, limit),
    queryFn: () => auditApi.getAuditLogs(offset, limit),
  });
};
