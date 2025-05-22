export interface ApiSongResult {
  songId: string;
  status: 'added' | 'duplicate' | 'error' | 'forbidden';
  message: string;
}

export interface ApiSummary {
  totalProcessed: number;
  successfullyAdded: number;
  duplicates: number;
  forbidden: number;
  errors: number;
}

export interface ApiBatchResponse {
  results: ApiSongResult[];
  summary: ApiSummary;
  error?: string;
}
