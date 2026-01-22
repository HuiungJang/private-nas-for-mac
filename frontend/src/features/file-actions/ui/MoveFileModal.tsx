import React, {useState} from 'react';
import {Button, Dialog, DialogActions, DialogContent, DialogTitle,} from '@mui/material';
import {FolderPicker} from './folder-picker/FolderPicker';
import {useFileActions} from '../model/useFileActions';

interface MoveFileModalProps {
  open: boolean;
  onClose: () => void;
  selectedFiles: Set<string>;
  sourceDirectory: string;
  onSuccess: () => void;
}

export const MoveFileModal: React.FC<MoveFileModalProps> = ({
                                                              open,
                                                              onClose,
                                                              selectedFiles,
                                                              sourceDirectory,
                                                              onSuccess,
                                                            }) => {
  const [destinationPath, setDestinationPath] = useState('/');
  const {moveFile, isMoving} = useFileActions();

  const handleMove = async () => {
    // Iterate and move each file
    const filesToMove = Array.from(selectedFiles);

    // Normalize paths
    const cleanSourceDir = sourceDirectory.endsWith('/') ? sourceDirectory : `${sourceDirectory}/`;
    const cleanDestDir = destinationPath.endsWith('/') ? destinationPath : `${destinationPath}/`;

    try {
      for (const fileName of filesToMove) {
        const source = `${cleanSourceDir}${fileName}`;
        const destination = `${cleanDestDir}${fileName}`;

        // Skip if source and dest are same (same directory)
        if (cleanSourceDir === cleanDestDir) continue;

        await moveFile({sourcePath: source, destinationPath: destination});
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to move files", error);
      // Ideally show toast here
    }
  };

  return (
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>Move {selectedFiles.size} items to...</DialogTitle>
        <DialogContent dividers>
          <FolderPicker
              currentPath={destinationPath}
              onNavigate={setDestinationPath}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isMoving}>Cancel</Button>
          <Button onClick={handleMove} variant="contained" disabled={isMoving}>
            Move Here
          </Button>
        </DialogActions>
      </Dialog>
  );
};
