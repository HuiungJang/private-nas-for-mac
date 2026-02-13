import React, {useRef, useState} from 'react';
import {Button, IconButton, Stack, Tooltip, useMediaQuery, useTheme} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DriveFileMoveIcon from '@mui/icons-material/DriveFileMove';
import RefreshIcon from '@mui/icons-material/Refresh';
import {useFileActions} from '../model/useFileActions';
import {AppButton} from '@/shared/ui';
import {MoveFileModal} from './MoveFileModal';

interface FileActionsToolbarProps {
  selectedFiles: Set<string>;
  currentPath: string;
  onClearSelection: () => void;
  onRefresh?: () => void;
}

export const FileActionsToolbar: React.FC<FileActionsToolbarProps> = ({
                                                                        selectedFiles,
                                                                        currentPath,
                                                                        onClearSelection,
                                                                        onRefresh,
                                                                      }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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

        {onRefresh && (
          isMobile ? (
            <Tooltip title="Refresh">
              <IconButton onClick={onRefresh} color="inherit">
                <RefreshIcon/>
              </IconButton>
            </Tooltip>
          ) : (
            <Button
              variant="outlined"
              startIcon={<RefreshIcon/>}
              onClick={onRefresh}
              sx={{borderRadius: '12px', textTransform: 'none', fontWeight: 600}}
            >
              Refresh
            </Button>
          )
        )}

        {isMobile ? (
            <Tooltip title="Upload">
              <IconButton onClick={handleUploadClick} disabled={isUploading} color="primary">
                <UploadFileIcon/>
              </IconButton>
            </Tooltip>
        ) : (
        <AppButton
            variant="contained"
            startIcon={<UploadFileIcon/>}
            onClick={handleUploadClick}
            disabled={isUploading}
        >
          Upload
        </AppButton>
        )}

        {selectedFiles.size > 0 && (
            <>
              {isMobile ? (
                  <Tooltip title="Move">
                    <IconButton onClick={() => setIsMoveModalOpen(true)} color="primary">
                      <DriveFileMoveIcon/>
                    </IconButton>
                  </Tooltip>
              ) : (
                  <Button
                      variant="outlined"
                      startIcon={<DriveFileMoveIcon/>}
                      onClick={() => setIsMoveModalOpen(true)}
                      sx={{borderRadius: '12px', textTransform: 'none', fontWeight: 600}}
                  >
                    Move
                  </Button>
              )}

              {isMobile ? (
                  <Tooltip title={`Delete (${selectedFiles.size})`}>
                    <IconButton onClick={handleDelete} disabled={isDeleting} color="error">
                      <DeleteIcon/>
                    </IconButton>
                  </Tooltip>
              ) : (
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
              )}

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

