const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp']);
const VIDEO_EXTENSIONS = new Set(['mp4', 'mov', 'm4v', 'webm', 'avi', 'mkv']);

export const getExtension = (name: string): string => {
  return name.split('.').pop()?.toLowerCase() ?? '';
};

export const isImageFile = (name: string): boolean => IMAGE_EXTENSIONS.has(getExtension(name));
export const isVideoFile = (name: string): boolean => VIDEO_EXTENSIONS.has(getExtension(name));
export const isPreviewableMedia = (name: string): boolean => isImageFile(name) || isVideoFile(name);
