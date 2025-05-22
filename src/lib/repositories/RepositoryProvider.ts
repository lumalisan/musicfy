import SongRepository from './SongRepository';
import AlbumRepository from './AlbumRepository';
import PlaylistRepository from './PlaylistRepository';

class RepositoryProvider {
  private static instance: RepositoryProvider;
  public readonly song: typeof SongRepository;
  public readonly album: typeof AlbumRepository;
  public readonly playlist: typeof PlaylistRepository;

  private constructor() {
    this.song = SongRepository;
    this.album = AlbumRepository;
    this.playlist = PlaylistRepository;
  }

  public static getInstance(): RepositoryProvider {
    if (!RepositoryProvider.instance) {
      RepositoryProvider.instance = new RepositoryProvider();
    }
    return RepositoryProvider.instance;
  }
}

const repository = RepositoryProvider.getInstance();

export { repository };
export default repository;
