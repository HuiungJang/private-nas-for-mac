import {apiClient} from '@/shared/api/axios';
import {DirectoryListing} from '../model/types';

export const fileApi = {
  listFiles: async (path?: string): Promise<DirectoryListing> => {
    const params = path ? {path} : {};
    const response = await apiClient.get<DirectoryListing>('/admin/files/list', {params});
    return response.data;
  },
};
