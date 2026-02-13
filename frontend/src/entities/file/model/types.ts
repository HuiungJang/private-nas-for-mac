export interface FileNode {
  name: string;
  path: string;
  type: 'FILE' | 'DIRECTORY';
  size: number;
  lastModified: string;
  owner: string;
}

export interface PathNode {
  name: string;
  path: string;
}

export interface DeleteFilesFailure {
  path: string;
  reason: string;
}

export interface DeleteFilesResponse {
  deleted: string[];
  failed: DeleteFilesFailure[];
}

export interface DirectoryListing {
  currentPath: string;
  breadcrumbs: PathNode[];
  items: FileNode[];
}
