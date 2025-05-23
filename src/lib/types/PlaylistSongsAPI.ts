export type ApiSongResult = {
  songId: string;
  status: 'added' | 'duplicate' | 'error' | 'forbidden';
  message: string;
};

export type ApiSummary = {
  totalProcessed: number;
  successfullyAdded: number;
  duplicates: number;
  forbidden: number;
  errors: number;
};

export type ApiBatchResponse = {
  results: ApiSongResult[];
  summary: ApiSummary;
  error?: string;
};
