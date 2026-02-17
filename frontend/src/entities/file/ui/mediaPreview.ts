const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp']);
const VIDEO_EXTENSIONS = new Set(['mp4', 'mov', 'm4v', 'webm', 'avi', 'mkv']);
const TEXT_PREVIEW_EXTENSIONS = new Set([
  'txt',
  'md',
  'markdown',
  'json',
  'yml',
  'yaml',
  'csv',
  'log',
  'xml',
  'ini',
  'conf',
  // code / script
  'js',
  'mjs',
  'cjs',
  'jsx',
  'ts',
  'tsx',
  'py',
  'rb',
  'java',
  'go',
  'rs',
  'c',
  'cc',
  'cpp',
  'h',
  'hh',
  'hpp',
  'cs',
  'php',
  'swift',
  'kt',
  'kts',
  'sql',
  'sh',
  'bash',
  'zsh',
  'ps1',
  'r',
  'lua',
  'dart',
]);

export const getExtension = (name: string): string => {
  return name.split('.').pop()?.toLowerCase() ?? '';
};

export const isImageFile = (name: string): boolean => IMAGE_EXTENSIONS.has(getExtension(name));
export const isVideoFile = (name: string): boolean => VIDEO_EXTENSIONS.has(getExtension(name));
export const isTextPreviewFile = (name: string): boolean =>
  TEXT_PREVIEW_EXTENSIONS.has(getExtension(name));
export const isPreviewableMedia = (name: string): boolean =>
  isImageFile(name) || isVideoFile(name) || isTextPreviewFile(name);
