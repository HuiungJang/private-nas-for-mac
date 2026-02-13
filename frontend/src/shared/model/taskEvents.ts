export type FileTaskType = 'file.delete' | 'file.upload' | 'file.move';

export interface FileTaskPayload {
  type: FileTaskType;
  count?: number;
  fileName?: string;
  sourcePath?: string;
  destinationPath?: string;
}

export const buildTaskLabel = (payload: FileTaskPayload): string => {
  switch (payload.type) {
    case 'file.delete':
      return `Delete ${payload.count ?? 0} file(s)`;
    case 'file.upload':
      return `Upload ${payload.fileName ?? 'file'}`;
    case 'file.move':
      return `Move ${payload.sourcePath ?? ''} -> ${payload.destinationPath ?? ''}`;
  }
};
