import albumRepositoryInstance from './AlbumRepository';
import playlistRepositoryInstance from './PlaylistRepository';
import songRepositoryInstance from './SongRepository';
import searchRepositoryInstance from './SearchRepository';
import playbackRepositoryInstance, {
  type PlaybackDetailsResponse,
  type PlaybackItemInfo,
} from './PlaybackRepository';

export const albumRepository = albumRepositoryInstance;
export const playlistRepository = playlistRepositoryInstance;
export const songRepository = songRepositoryInstance;
export const searchRepository = searchRepositoryInstance;
export const playbackRepository = playbackRepositoryInstance;

const repository = {
  album: albumRepositoryInstance,
  playlist: playlistRepositoryInstance,
  song: songRepositoryInstance,
  search: searchRepositoryInstance,
  playback: playbackRepositoryInstance,
};

export { repository };
export default repository;

export * from './BaseRepository';
export * from './SongRepository';
export * from './AlbumRepository';
export * from './PlaylistRepository';
export * from './SearchRepository';
export * from './PlaybackRepository';
export type { PlaybackDetailsResponse, PlaybackItemInfo };
