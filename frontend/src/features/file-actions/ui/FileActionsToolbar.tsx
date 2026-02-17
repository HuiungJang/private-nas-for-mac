import React, {useRef, useState} from 'react';
import {
  Badge,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  useMediaQuery,
  useTheme
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DriveFileMoveIcon from '@mui/icons-material/DriveFileMove';
import RefreshIcon from '@mui/icons-material/Refresh';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import {useFileActions} from '../model/useFileActions';
import {AppButton} from '@/shared/ui';
import {MoveFileModal} from './MoveFileModal';
import {uploadDebugLog} from '@/shared/debug/uploadDebug';

interface FileActionsToolbarProps {
  selectedFiles: Set<string>;
  currentPath: string;
  onClearSelection: () => void;
  onRefresh?: () => void | Promise<unknown>;
}

export const FileActionsToolbar: React.FC<FileActionsToolbarProps> = ({
                                                                        selectedFiles,
                                                                        currentPath,
                                                                        onClearSelection,
                                                                        onRefresh,
                                                                      }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const {deleteFiles, isDeleting, uploadFile, isUploading, createDirectory, isCreatingDirectory} = useFileActions();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [isCreateDirModalOpen, setIsCreateDirModalOpen] = useState(false);
  const [newDirectoryName, setNewDirectoryName] = useState('');

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const buildSelectedPaths = () => {
    return Array.from(selectedFiles).map((name) => {
      const cleanPath = currentPath.endsWith('/') ? currentPath : `${currentPath}/`;
      return `${cleanPath}${name}`;
    });
  };

  const handleDelete = async () => {
    const paths = buildSelectedPaths();
    if (paths.length === 0) return;

    await deleteFiles(paths);
    await onRefresh?.();
    onClearSelection();
    setIsDeleteConfirmOpen(false);
  };

  const handleUploadClick = () => {
    uploadDebugLog('A) Upload button clicked', {
      selectedCount: selectedFiles.size,
      isUploading,
    });
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;

    uploadDebugLog('B) file input change received', {
      fileCount: files?.length ?? 0,
      files: files ? Array.from(files).map((file) => ({name: file.name, size: file.size})) : [],
    });

    if (files && files.length > 0) {
      // Upload one by one for now
      for (let i = 0; i < files.length; i++) {
        await uploadFile({file: files[i], directory: currentPath});
      }

      // Ensure visible list refreshes immediately after upload completes.
      await onRefresh?.();
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateDirectoryName = (name: string): string | null => {
    const trimmed = name.trim();
    if (!trimmed) return 'Folder name is required.';
    if (trimmed === '.' || trimmed === '..') return 'Folder name cannot be . or ..';
    if (trimmed.includes('/') || trimmed.includes('\\')) return 'Folder name cannot include / or \\';
    return null;
  };

  const handleCreateDirectory = async () => {
    const error = validateDirectoryName(newDirectoryName);
    if (error) return;

    await createDirectory({parentPath: currentPath, name: newDirectoryName.trim()});
    await onRefresh?.();
    setIsCreateDirModalOpen(false);
    setNewDirectoryName('');
  };

  const handleOpenCreateDirectoryModal = () => {
    setIsCreateDirModalOpen(true);
  };

  const handleCloseCreateDirectoryModal = () => {
    if (isCreatingDirectory) return;
    setIsCreateDirModalOpen(false);
    setNewDirectoryName('');
  };

  const directoryNameError = validateDirectoryName(newDirectoryName);

  return (
      <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap" justifyContent="flex-end">
        <input
            type="file"
            multiple
            style={{display: 'none'}}
            ref={fileInputRef}
            onChange={handleFileChange}
        />

        {isMobile ? (
            <Tooltip title="Upload files">
              <Badge color="primary" variant="dot" invisible={isUploading}>
                <IconButton onClick={handleUploadClick} disabled={isUploading} color="primary">
                  <UploadFileIcon/>
                </IconButton>
              </Badge>
            </Tooltip>
        ) : (
        <AppButton
            variant="contained"
            startIcon={<UploadFileIcon/>}
            onClick={handleUploadClick}
            disabled={isUploading}
        >
          Upload Files
        </AppButton>
        )}

        {isMobile ? (
          <Tooltip title="Create folder">
            <IconButton onClick={handleOpenCreateDirectoryModal} disabled={isCreatingDirectory} color="inherit">
              <CreateNewFolderIcon/>
            </IconButton>
          </Tooltip>
        ) : (
          <Button
            variant="outlined"
            startIcon={<CreateNewFolderIcon/>}
            onClick={handleOpenCreateDirectoryModal}
            disabled={isCreatingDirectory}
            sx={{borderRadius: '12px', textTransform: 'none', fontWeight: 600}}
          >
            New Folder
          </Button>
        )}

        {onRefresh && (
          isMobile ? (
            <Tooltip title="Refresh list">
              <IconButton onClick={onRefresh} color="inherit">
                <RefreshIcon/>
              </IconButton>
            </Tooltip>
          ) : (
            <Button
              variant="text"
              startIcon={<RefreshIcon/>}
              onClick={onRefresh}
              sx={{borderRadius: '12px', textTransform: 'none', fontWeight: 600}}
            >
              Refresh
            </Button>
          )
        )}

        <Dialog open={isCreateDirModalOpen} onClose={handleCloseCreateDirectoryModal} fullWidth maxWidth="xs">
          <DialogTitle>Create New Folder</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Folder name"
              fullWidth
              value={newDirectoryName}
              onChange={(e) => setNewDirectoryName(e.target.value)}
              error={Boolean(directoryNameError)}
              helperText={directoryNameError ?? 'Use a simple name like photos-2026'}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !directoryNameError && !isCreatingDirectory) {
                  e.preventDefault();
                  void handleCreateDirectory();
                }
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseCreateDirectoryModal} disabled={isCreatingDirectory}>Cancel</Button>
            <Button onClick={handleCreateDirectory} variant="contained" disabled={Boolean(directoryNameError) || isCreatingDirectory}>
              Create
            </Button>
          </DialogActions>
        </Dialog>

        {selectedFiles.size > 0 && (
            <>
              <Divider orientation="vertical" flexItem sx={{mx: 0.5}}/>
              {!isMobile && (
                <Button size="small" variant="text" color="inherit" disableRipple>
                  {selectedFiles.size} selected
                </Button>
              )}
              {isMobile ? (
                  <Tooltip title="Move selected">
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
                  <Tooltip title={`Delete selected (${selectedFiles.size})`}>
                    <IconButton onClick={() => setIsDeleteConfirmOpen(true)} disabled={isDeleting} color="error">
                      <DeleteIcon/>
                    </IconButton>
                  </Tooltip>
              ) : (
                  <Button
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon/>}
                      onClick={() => setIsDeleteConfirmOpen(true)}
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
                  onSuccess={async () => {
                    onClearSelection();
                    await onRefresh?.();
                  }}
              />

              <Dialog open={isDeleteConfirmOpen} onClose={() => setIsDeleteConfirmOpen(false)} fullWidth maxWidth="xs">
                <DialogTitle>Delete items</DialogTitle>
                <DialogContent>
                  Delete {selectedFiles.size} item(s)?
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setIsDeleteConfirmOpen(false)} disabled={isDeleting}>Cancel</Button>
                  <Button onClick={() => void handleDelete()} variant="contained" color="error" disabled={isDeleting}>
                    Delete
                  </Button>
                </DialogActions>
              </Dialog>
            </>
        )}
      </Stack>
  );
};

