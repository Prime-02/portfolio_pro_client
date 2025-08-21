
// Type definitions
 export interface MediaFile {
  media_type: "image" | "video" | "audio" | "unknown";
  file_size: number;
  media_file: File;
  id: string;
  name?: string;
  preview_url?: string;
  duration?: number;
  trimStart?: number;
  trimEnd?: number;
  trimmed_duration?: number;
}

export interface AcceptedTypes {
  [key: string]: string[];
}

export interface ErrorState {
  message: string;
  type: "size" | "type" | "cooldown" | "duplicate" | "general";
}


export interface VideoTrimmerProps {
  file: MediaFile;
  onTrim: (trimData: {
    trimStart: number;
    trimEnd: number;
    trimmed_duration: number;
  }) => void;
  onCancel: () => void;
}

export interface MediaPreviewProps {
  files: MediaFile[];
  onRemove: (id: string) => void;
  onTrimVideo: (file: MediaFile) => void;
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export interface MediaPickerProps {
  maxFiles?: number;
  onMediaChange?: (files: MediaFile[]) => void;
  acceptedTypes?: AcceptedTypes;
  devMode?: boolean;
  maxFileSize?: number;
  uploadCooldown?: number;
  loading?: boolean;
  onClick?: () => void;
  maxVideoDuration?: number;
}

export interface VideoPickerProps {
  maxFiles?: number;
  onVideoChange?: (files: MediaFile[]) => void;
  devMode?: boolean;
  maxFileSize?: number;
  uploadCooldown?: number;
  loading?: boolean;
  onClick?: () => void;
  maxVideoDuration?: number;
  autoTrimToLimit?: boolean;
}
