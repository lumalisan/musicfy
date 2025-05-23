import { useState, useCallback } from 'react';

import playlistRepository from '@/lib/repositories/PlaylistRepository';
import type { ApiBatchResponse } from '@/lib/types/PlaylistSongsAPI';
import type { Song } from '@/lib/types/Song';

export type SongAddStatusItem = {
  songId: string;
  songTitle: string;
  success: boolean;
  message: string;
};

export type AddSongsStatusReport = {
  successCount: number;
  errorCount: number;
  errors: { songId: string; songTitle: string; message: string }[];
  individualResults: SongAddStatusItem[];
};

type UseAddSongsToPlaylistParams = {
  playlistId: string;
  onBatchComplete: (report: AddSongsStatusReport) => void;
};

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
        const responseData: ApiBatchResponse =
          await playlistRepository.addSongToPlaylist(playlistId, songIdArray);
        const apiResults = responseData.results || [];
        const apiSummary = responseData.summary || {
          totalProcessed: songIdArray.length,
          successfullyAdded: 0,
          duplicates: 0,
          forbidden: 0,
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
          errorCount: (apiSummary.errors || 0) + (apiSummary.forbidden || 0),
          errors: detailedErrorsReport,
          individualResults: individualResultsTransformed,
        };
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
