import {useQuery} from '@tanstack/react-query';
import {fileApi} from '../api/fileApi';
import type {DirectoryListing} from './types';

export const useFiles = (path?: string) => {
  return useQuery<DirectoryListing>({
    queryKey: ['files', path],
    queryFn: () => fileApi.listFiles(path),
  });
};
