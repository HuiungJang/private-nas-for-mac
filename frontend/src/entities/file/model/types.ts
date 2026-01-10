export interface FileNode {
  name: string;
  type: 'FILE' | 'DIRECTORY';
  size: number;
  lastModified: string;
  owner: string;
}

export interface PathNode {
  name: string;
  path: string;
}

export interface DirectoryListing {
  currentPath: string;
  breadcrumbs: PathNode[];
  items: FileNode[];
}
