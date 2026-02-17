import {useMutation, useQueryClient} from '@tanstack/react-query';
import {fileApi} from '@/entities/file/api/fileApi';
import {useNotificationStore} from '@/shared/model/useNotificationStore';
import {useTaskCenterStore} from '@/shared/model/useTaskCenterStore';
import {queryKeys} from '@/shared/model/queryKeys';

export const useFileActions = () => {
  const queryClient = useQueryClient();
  const showNotification = useNotificationStore((state) => state.showNotification);
  const startTask = useTaskCenterStore((s) => s.startTask);
  const completeTask = useTaskCenterStore((s) => s.completeTask);
  const failTask = useTaskCenterStore((s) => s.failTask);

  const deleteFilesMutation = useMutation({
    mutationFn: async (paths: string[]) => {
      const taskId = startTask({
        task: {type: 'file.delete', count: paths.length},
        onRetry: async () => {
          await fileApi.deleteFiles(paths);
          queryClient.invalidateQueries({queryKey: queryKeys.files(), exact: false});
        },
      });
      try {
        const result = await fileApi.deleteFiles(paths);
        completeTask(taskId);
        return {result, taskId, paths};
      } catch (e: any) {
        failTask(taskId, e?.message || 'Delete failed');
        throw e;
      }
    },
    onMutate: async (paths) => {
      await queryClient.cancelQueries({queryKey: queryKeys.files(), exact: false});
      const snapshots = queryClient.getQueriesData({queryKey: queryKeys.files(), exact: false});

      snapshots.forEach(([key, data]: any) => {
        if (!data?.items) return;
        queryClient.setQueryData(key, {
          ...data,
          items: data.items.filter((item: any) => !paths.includes(item.path)),
        });
      });

      return {snapshots};
    },
    onError: (_err, _vars, context) => {
      context?.snapshots?.forEach(([key, data]: any) => queryClient.setQueryData(key, data));
    },
    onSuccess: (payload) => {
      queryClient.invalidateQueries({queryKey: queryKeys.files(), exact: false});
      const failedCount = payload.result.failed.length;
      if (failedCount > 0) {
        showNotification(`Delete completed with ${failedCount} failure(s)`, 'error');
      } else {
        showNotification('Files deleted successfully', 'success');
      }
    },
  });

  const uploadFileMutation = useMutation({
    mutationFn: async ({file, directory}: { file: File; directory: string }) => {
      const taskId = startTask({
        task: {type: 'file.upload', fileName: file.name},
        onRetry: async () => {
          await fileApi.uploadFile(file, directory);
          queryClient.invalidateQueries({queryKey: queryKeys.files(), exact: false});
        },
      });
      try {
        const result = await fileApi.uploadFile(file, directory);
        completeTask(taskId);
        return result;
      } catch (e: any) {
        failTask(taskId, e?.message || 'Upload failed');
        throw e;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: queryKeys.files(), exact: false});
      showNotification('File uploaded successfully', 'success');
    },
  });

  const createDirectoryMutation = useMutation({
    mutationFn: async ({parentPath, name}: { parentPath: string; name: string }) => {
      const taskId = startTask({
        task: {type: 'file.mkdir', fileName: name},
        onRetry: async () => {
          await fileApi.createDirectory(parentPath, name);
          queryClient.invalidateQueries({queryKey: queryKeys.files(), exact: false});
        },
      });
      try {
        const result = await fileApi.createDirectory(parentPath, name);
        completeTask(taskId);
        return result;
      } catch (e: any) {
        failTask(taskId, e?.message || 'Create folder failed');
        throw e;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: queryKeys.files(), exact: false});
      showNotification('Folder created successfully', 'success');
    },
  });

  const moveFilesBatchMutation = useMutation({
    mutationFn: async (moves: Array<{ sourcePath: string; destinationPath: string }>) => {
      const taskId = startTask({
        task: `Move ${moves.length} item(s)`,
        onRetry: async () => {
          for (const move of moves) {
            await fileApi.moveFile(move.sourcePath, move.destinationPath);
          }
          queryClient.invalidateQueries({queryKey: queryKeys.files(), exact: false});
        },
      });
      let successCount = 0;
      const failures: Array<{ sourcePath: string; reason: string }> = [];

      for (const move of moves) {
        try {
          await fileApi.moveFile(move.sourcePath, move.destinationPath);
          successCount += 1;
        } catch (e: any) {
          failures.push({sourcePath: move.sourcePath, reason: e?.message || 'Move failed'});
        }
      }

      if (failures.length > 0) {
        failTask(taskId, `${failures.length} failed`);
      } else {
        completeTask(taskId);
      }

      return {successCount, failures, total: moves.length};
    },
    onSuccess: ({successCount, failures, total}) => {
      queryClient.invalidateQueries({queryKey: queryKeys.files(), exact: false});
      if (failures.length > 0) {
        showNotification(`Moved ${successCount}/${total}. ${failures.length} failed`, 'error');
      } else {
        showNotification(`Moved ${successCount} item(s) successfully`, 'success');
      }
    },
  });

  const moveFileMutation = useMutation({
    mutationFn: async ({sourcePath, destinationPath}: { sourcePath: string; destinationPath: string }) => {
      const taskId = startTask({
        task: {type: 'file.move', sourcePath, destinationPath},
        onRetry: async () => {
          await fileApi.moveFile(sourcePath, destinationPath);
          queryClient.invalidateQueries({queryKey: queryKeys.files(), exact: false});
        },
      });
      try {
        const result = await fileApi.moveFile(sourcePath, destinationPath);
        completeTask(taskId);
        return {result, sourcePath, destinationPath};
      } catch (e: any) {
        failTask(taskId, e?.message || 'Move failed');
        throw e;
      }
    },
    onMutate: async ({sourcePath, destinationPath}) => {
      await queryClient.cancelQueries({queryKey: queryKeys.files(), exact: false});
      const snapshots = queryClient.getQueriesData({queryKey: queryKeys.files(), exact: false});

      snapshots.forEach(([key, data]: any) => {
        if (!data?.items) return;
        queryClient.setQueryData(key, {
          ...data,
          items: data.items.map((item: any) =>
            item.path === sourcePath ? {...item, path: destinationPath, name: destinationPath.split('/').pop() ?? item.name} : item
          ),
        });
      });

      return {snapshots};
    },
    onError: (_err, _vars, context) => {
      context?.snapshots?.forEach(([key, data]: any) => queryClient.setQueryData(key, data));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: queryKeys.files(), exact: false});
      showNotification('Files moved successfully', 'success');
    },
  });

  return {
    deleteFiles: deleteFilesMutation.mutateAsync,
    isDeleting: deleteFilesMutation.isPending,
    uploadFile: uploadFileMutation.mutateAsync,
    isUploading: uploadFileMutation.isPending,
    createDirectory: createDirectoryMutation.mutateAsync,
    isCreatingDirectory: createDirectoryMutation.isPending,
    moveFile: moveFileMutation.mutateAsync,
    moveFilesBatch: moveFilesBatchMutation.mutateAsync,
    isMoving: moveFileMutation.isPending || moveFilesBatchMutation.isPending,
  };
};
