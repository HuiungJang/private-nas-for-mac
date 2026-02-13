import {useQuery} from '@tanstack/react-query';
import {fileApi} from '../api/fileApi';
import type {DirectoryListing} from './types';
import {queryKeys} from '@/shared/model/queryKeys';

export const useFiles = (path?: string) => {
  return useQuery<DirectoryListing>({
    queryKey: queryKeys.files(path),
    queryFn: () => fileApi.listFiles(path),
  });
};
