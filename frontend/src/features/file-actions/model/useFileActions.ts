import {useMutation, useQueryClient} from '@tanstack/react-query';
import {fileApi} from '@/entities/file/api/fileApi';

export const useFileActions = () => {
  const queryClient = useQueryClient();

  const deleteFilesMutation = useMutation({
    mutationFn: (paths: string[]) => fileApi.deleteFiles(paths),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['files']});
    },
  });

  const uploadFileMutation = useMutation({
    mutationFn: ({file, directory}: { file: File; directory: string }) =>
        fileApi.uploadFile(file, directory),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['files']});
    },
  });

  const moveFileMutation = useMutation({
    mutationFn: ({sourcePath, destinationPath}: { sourcePath: string; destinationPath: string }) =>
        fileApi.moveFile(sourcePath, destinationPath),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['files']});
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
