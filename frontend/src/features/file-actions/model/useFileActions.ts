import {useMutation, useQueryClient} from '@tanstack/react-query';
import {fileApi} from '@/entities/file/api/fileApi';
import {useNotificationStore} from '@/shared/model/useNotificationStore';

export const useFileActions = () => {
  const queryClient = useQueryClient();
  const showNotification = useNotificationStore((state) => state.showNotification);

  const deleteFilesMutation = useMutation({
    mutationFn: (paths: string[]) => fileApi.deleteFiles(paths),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['files']});
      showNotification('Files deleted successfully', 'success');
    },
  });

  const uploadFileMutation = useMutation({
    mutationFn: ({file, directory}: { file: File; directory: string }) =>
        fileApi.uploadFile(file, directory),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['files']});
      showNotification('File uploaded successfully', 'success');
    },
  });

  const moveFileMutation = useMutation({
    mutationFn: ({sourcePath, destinationPath}: { sourcePath: string; destinationPath: string }) =>
        fileApi.moveFile(sourcePath, destinationPath),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['files']});
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

