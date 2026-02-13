import {useQuery} from '@tanstack/react-query';
import {systemApi} from '../api/systemApi';
import type {SystemHealth} from './types';
import {queryKeys} from '@/shared/model/queryKeys';

export const useSystemHealth = () => {
  return useQuery<SystemHealth>({
    queryKey: queryKeys.systemHealth(),
    queryFn: systemApi.getHealth,
    refetchInterval: 5000, // Poll every 5 seconds
  });
};
