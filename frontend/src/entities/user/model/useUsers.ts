import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {userApi} from '../api/userApi';
import type {CreateUserRequest, UpdateUserRequest, UserSummary} from './types';
import {queryKeys} from '@/shared/model/queryKeys';

export const useUsers = () => {
  return useQuery<UserSummary[]>({
    queryKey: queryKeys.users(),
    queryFn: userApi.listUsers,
  });
};

export const useUserMutations = () => {
  const queryClient = useQueryClient();

  const createUserMutation = useMutation({
    mutationFn: (data: CreateUserRequest) => userApi.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: queryKeys.users()});
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({id, data}: {
      id: string;
      data: UpdateUserRequest
    }) => userApi.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: queryKeys.users()});
    },
  });

  return {
    createUser: createUserMutation.mutateAsync,
    isCreating: createUserMutation.isPending,
    updateUser: updateUserMutation.mutateAsync,
    isUpdating: updateUserMutation.isPending,
  };
};
