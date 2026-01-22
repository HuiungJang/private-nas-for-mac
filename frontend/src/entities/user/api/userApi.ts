import {apiClient} from '@/shared/api/axios';
import type {CreateUserRequest, UpdateUserRequest, UserSummary} from '../model/types';

export const userApi = {
  listUsers: async (): Promise<UserSummary[]> => {
    const response = await apiClient.get<UserSummary[]>('/admin/users');
    return response.data;
  },

  createUser: async (data: CreateUserRequest): Promise<void> => {
    await apiClient.post('/admin/users', data);
  },

  updateUser: async (id: string, data: UpdateUserRequest): Promise<void> => {
    await apiClient.put(`/admin/users/${id}`, data);
  },
};
