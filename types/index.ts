export interface GenerateRequest {
  prompt: string;
  sourceImage?: string;
  title: string;
  characterName: string;
  attribute: string;
  rarity: "normal" | "rare" | "super-rare";
  backgroundColor: string;
  effects: {
    holographic: boolean;
    sparkle: boolean;
    aura: boolean;
  };
  style: {
    frameType: string;
    frameColor: string;
  };
  async?: boolean;
}

export interface GenerateResponse {
  imageUrl: string;
  generationId: string;
  timestamp: string;
}

export interface GenerateAsyncResponse {
  taskId: string;
  status: "pending";
  message: string;
}

export interface TaskStatusResponse {
  taskId: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  imageUrl?: string;
  error?: string;
  result?: {
    imageUrl: string;
    generationId: string;
  };
}

export interface UploadResponse {
  imageUrl: string;
  uploadId: string;
}

export interface HistoryItem {
  id: string;
  imageUrl: string;
  title: string;
  characterName: string;
  rarity: string;
  createdAt: string;
  // legacy fields for backward compatibility
  generationId?: string;
  prompt?: string;
  timestamp?: string;
}

export interface HistoryResponse {
  history: Array<{
    generationId: string;
    imageUrl: string;
    prompt: string;
    timestamp: string;
    title: string;
    characterName: string;
    rarity: string;
  }>;
  total: number;
  hasMore: boolean;
}

export interface ErrorResponse {
  error: string;
  code?: string;
  details?: any;
}