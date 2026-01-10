import {useQuery} from '@tanstack/react-query';
import {fileApi} from '../api/fileApi';
import {DirectoryListing} from './types';

export const useFileTree = (path?: string) => {
  return useQuery<DirectoryListing>({
    queryKey: ['files', path],
    queryFn: () => fileApi.listFiles(path),
  });
};
