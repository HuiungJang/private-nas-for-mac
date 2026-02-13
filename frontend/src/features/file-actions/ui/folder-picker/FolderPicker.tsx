import React from 'react';
import {
  Box,
  CircularProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Typography,
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import {useFiles} from '@/entities/file/model/useFiles';
import {AppBreadcrumbs} from '@/shared/ui/AppBreadcrumbs';

interface FolderPickerProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const FolderPicker: React.FC<FolderPickerProps> = ({currentPath, onNavigate}) => {
  const {data, isLoading} = useFiles(currentPath);

  if (isLoading) {
    return (
        <Box sx={{display: 'flex', justifyContent: 'center', p: 4}}>
          <CircularProgress/>
        </Box>
    );
  }

  if (!data) {
    return <Typography color="error">Failed to load folders</Typography>;
  }

  const folders = data.items.filter((item) => item.type === 'DIRECTORY');

  return (
      <Box sx={{minHeight: '300px'}}>
        <Box sx={{mb: 1}}>
          <AppBreadcrumbs breadcrumbs={data.breadcrumbs} onNavigate={onNavigate}/>
        </Box>

        {folders.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{p: 2, textAlign: 'center'}}>
              No folders
            </Typography>
        ) : (
            <List>
              {folders.map((folder) => (
                  <ListItem key={folder.name} disablePadding>
                    <ListItemButton
                        onClick={() => onNavigate(`${data.currentPath === '/' ? '' : data.currentPath}/${folder.name}`)}>
                      <ListItemAvatar sx={{minWidth: 40}}>
                        <FolderIcon sx={{color: '#0A84FF'}}/>
                      </ListItemAvatar>
                      <ListItemText primary={folder.name}/>
                    </ListItemButton>
                  </ListItem>
              ))}
            </List>
        )}
      </Box>
  );
};
