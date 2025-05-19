import { useState, useCallback } from 'react';
import type { Song } from '@/lib/types/Song';
import { API_BASE_URL } from '@/lib/constants';

interface ApiSongResult {
  songId: string;
  status: 'added' | 'duplicate' | 'error' | 'forbidden';
  message: string;
}

interface ApiSummary {
  totalProcessed: number;
  successfullyAdded: number;
  duplicates: number;
  forbidden: number;
  errors: number;
}

interface ApiBatchResponse {
  results: ApiSongResult[];
  summary: ApiSummary;
  error?: string;
}

export interface SongAddStatusItem {
  songId: string;
  songTitle: string;
  success: boolean;
  message: string;
}

export interface AddSongsStatusReport {
  successCount: number;
  errorCount: number;
  errors: { songId: string; songTitle: string; message: string }[];
  individualResults: SongAddStatusItem[];
}

interface UseAddSongsToPlaylistParams {
  playlistId: string;
  onBatchComplete: (report: AddSongsStatusReport) => void;
}

export function useAddSongsToPlaylist({
  playlistId,
  onBatchComplete,
}: UseAddSongsToPlaylistParams) {
  const [isAdding, setIsAdding] = useState(false);
  const [addSongsStatus, setAddSongsStatus] =
    useState<AddSongsStatusReport | null>(null);

  const executeAddSongs = useCallback(
    async (
      songsToSubmit: Set<string>,
      songDetailsMap: Map<string, Pick<Song, 'id' | 'title'>>
    ) => {
      if (songsToSubmit.size === 0) return;

      setIsAdding(true);
      setAddSongsStatus(null);

      const songIdArray = Array.from(songsToSubmit);
      let report: AddSongsStatusReport;

      try {
        const response = await fetch(`${API_BASE_URL}/playlist-songs.json`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ playlistId, songIds: songIdArray }),
        });

        const responseData: ApiBatchResponse = await response.json();

        if (!response.ok) {
          // Handle non-ok responses (e.g., 400, 401, 403 before individual processing, 500)
          // The API might return a general error message in responseData.error
          const errorMessage =
            responseData.error ||
            `API request failed with status ${response.status}`;
          const detailedErrors: {
            songId: string;
            songTitle: string;
            message: string;
          }[] = [];
          const individualResults: SongAddStatusItem[] = [];

          songIdArray.forEach((songId) => {
            const details = songDetailsMap.get(songId) || {
              id: songId,
              title: `ID: ${songId}`,
            };
            const songError = {
              songId,
              songTitle: details.title,
              message: errorMessage,
            };
            detailedErrors.push(songError);
            individualResults.push({ ...songError, success: false });
          });

          report = {
            successCount: 0,
            errorCount: songIdArray.length,
            errors: detailedErrors,
            individualResults: individualResults,
          };
        } else {
          // Process successful response (e.g., 201, 207)
          const apiResults = responseData.results || [];
          const apiSummary = responseData.summary || {
            successfullyAdded: 0,
            errors: 0,
          };

          const individualResultsTransformed: SongAddStatusItem[] =
            apiResults.map((apiResult) => {
              const details = songDetailsMap.get(apiResult.songId) || {
                id: apiResult.songId,
                title: `ID: ${apiResult.songId}`,
              };
              return {
                songId: apiResult.songId,
                songTitle: details.title,
                success: apiResult.status === 'added',
                message: apiResult.message,
              };
            });

          const detailedErrorsReport: {
            songId: string;
            songTitle: string;
            message: string;
          }[] = individualResultsTransformed
            .filter((item) => !item.success)
            .map((item) => ({
              songId: item.songId,
              songTitle: item.songTitle,
              message: item.message,
            }));

          report = {
            successCount: apiSummary.successfullyAdded,
            errorCount: apiSummary.errors + apiSummary.forbidden,
            errors: detailedErrorsReport,
            individualResults: individualResultsTransformed,
          };
        }
      } catch (err: any) {
        console.error('Error executing add songs batch:', err);
        const detailedErrors: {
          songId: string;
          songTitle: string;
          message: string;
        }[] = [];
        const individualResults: SongAddStatusItem[] = [];
        songIdArray.forEach((songId) => {
          const details = songDetailsMap.get(songId) || {
            id: songId,
            title: `ID: ${songId}`,
          };
          const songError = {
            songId,
            songTitle: details.title,
            message: err.message || 'A network error occurred.',
          };
          detailedErrors.push(songError);
          individualResults.push({ ...songError, success: false });
        });
        report = {
          successCount: 0,
          errorCount: songIdArray.length,
          errors: detailedErrors,
          individualResults: individualResults,
        };
      }

      setAddSongsStatus(report);
      setIsAdding(false);
      onBatchComplete(report);
    },
    [playlistId, onBatchComplete]
  );

  const resetAddSongsStatus = useCallback(() => {
    setAddSongsStatus(null);
  }, []);

  return {
    isAdding,
    addSongsStatus,
    executeAddSongs,
    resetAddSongsStatus,
  };
}
