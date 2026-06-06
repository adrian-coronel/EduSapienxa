export type DocumentStatus = 'Pending' | 'Queued' | 'Parsing' | 'Chunking' | 'Embedding' | 'Completed' | 'Failed' | 'Paused';

export interface DocumentUpload {
  id: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  status: DocumentStatus;
  progressPct: number;
  errorMessage?: string | null;
  chunkCount?: number | null;
  totalTokens?: number | null;
  createdAt: string;
  completedAt?: string | null;
}

export interface DocumentStatusResult {
  status: DocumentStatus;
  progressPct: number;
  errorMessage?: string | null;
  chunkCount?: number | null;
}

export interface UploadDocumentResult {
  id: string;
  status: DocumentStatus;
}
