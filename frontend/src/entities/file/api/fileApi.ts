import {apiClient} from '@/shared/api/axios';
import type {DirectoryListing} from '../model/types';

export const fileApi = {
  listFiles: async (path?: string): Promise<DirectoryListing> => {
    const params = path ? {path} : {};
    const response = await apiClient.get<DirectoryListing>('/admin/files/list', {params});
    return response.data;
  },

  deleteFiles: async (paths: string[]): Promise<void> => {
    await apiClient.post('/admin/files/delete', {paths});
  },

  moveFile: async (sourcePath: string, destinationPath: string): Promise<void> => {
    await apiClient.post('/admin/files/move', {sourcePath, destinationPath});
  },

  uploadFile: async (file: File, directory: string): Promise<void> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('directory', directory);
    await apiClient.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};
