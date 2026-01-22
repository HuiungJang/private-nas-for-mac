import {useQuery} from '@tanstack/react-query';
import {systemApi} from '../api/systemApi';
import type {SystemHealth} from './types';

export const useSystemHealth = () => {
  return useQuery<SystemHealth>({
    queryKey: ['system-health'],
    queryFn: systemApi.getHealth,
    refetchInterval: 5000, // Poll every 5 seconds
  });
};
