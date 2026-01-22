import React, {useRef, useState} from 'react';
import {Button, Stack} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DriveFileMoveIcon from '@mui/icons-material/DriveFileMove';
import {useFileActions} from '../model/useFileActions';
import {IOSButton} from '@/shared/ui';
import {MoveFileModal} from './MoveFileModal';

interface FileActionsToolbarProps {
  selectedFiles: Set<string>;
  currentPath: string;
  onClearSelection: () => void;
}

export const FileActionsToolbar: React.FC<FileActionsToolbarProps> = ({
                                                                        selectedFiles,
                                                                        currentPath,
                                                                        onClearSelection,
                                                                      }) => {
  const {deleteFiles, isDeleting, uploadFile, isUploading} = useFileActions();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete ${selectedFiles.size} items?`)) {
      const paths = Array.from(selectedFiles).map(name => {
        const cleanPath = currentPath.endsWith('/') ? currentPath : `${currentPath}/`;
        return `${cleanPath}${name}`;
      });

      await deleteFiles(paths);
      onClearSelection();
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      // Upload one by one for now
      for (let i = 0; i < files.length; i++) {
        await uploadFile({file: files[i], directory: currentPath});
      }
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
      <Stack direction="row" spacing={1}>
        <input
            type="file"
            multiple
            style={{display: 'none'}}
            ref={fileInputRef}
            onChange={handleFileChange}
        />

        <IOSButton
            variant="contained"
            startIcon={<UploadFileIcon/>}
            onClick={handleUploadClick}
            disabled={isUploading}
        >
          Upload
        </IOSButton>

        {selectedFiles.size > 0 && (
            <>
              <Button
                  variant="outlined"
                  startIcon={<DriveFileMoveIcon/>}
                  onClick={() => setIsMoveModalOpen(true)}
                  sx={{borderRadius: '12px', textTransform: 'none', fontWeight: 600}}
              >
                Move
              </Button>
              <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon/>}
                  onClick={handleDelete}
                  disabled={isDeleting}
                  sx={{borderRadius: '12px', textTransform: 'none', fontWeight: 600}}
              >
                Delete ({selectedFiles.size})
              </Button>

              <MoveFileModal
                  open={isMoveModalOpen}
                  onClose={() => setIsMoveModalOpen(false)}
                  selectedFiles={selectedFiles}
                  sourceDirectory={currentPath}
                  onSuccess={onClearSelection}
              />
            </>
        )}
      </Stack>
  );
};
