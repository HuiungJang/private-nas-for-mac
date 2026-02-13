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
      const taskId = startTask({type: 'file.delete', count: paths.length});
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
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: queryKeys.files(), exact: false});
      showNotification('Files deleted successfully', 'success');
    },
  });

  const uploadFileMutation = useMutation({
    mutationFn: async ({file, directory}: { file: File; directory: string }) => {
      const taskId = startTask({type: 'file.upload', fileName: file.name});
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

  const moveFileMutation = useMutation({
    mutationFn: async ({sourcePath, destinationPath}: { sourcePath: string; destinationPath: string }) => {
      const taskId = startTask({type: 'file.move', sourcePath, destinationPath});
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
    moveFile: moveFileMutation.mutateAsync,
    isMoving: moveFileMutation.isPending,
  };
};
