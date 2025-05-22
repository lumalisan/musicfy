import { render, screen } from '@testing-library/react';
import SongsTable from './SongsTable';
import { usePlayerStore } from '@/store/playerStore';
import type { ItemInfo } from '@/lib/types/ItemInfo';
import type { Song } from '@/lib/types/Song';
import { faClock } from '@fortawesome/free-solid-svg-icons';

// Mock dependencies
jest.mock('@/store/playerStore');
const mockUsePlayerStore = usePlayerStore as unknown as jest.Mock;

// Mock FontAwesomeIcon to prevent actual rendering issues in tests if not needed
jest.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: jest.fn((props) => (
    <i data-testid={`icon-${props.icon.iconName}`}></i>
  )),
}));

const mockItemInfo: ItemInfo = {
  id: 'album1',
  type: 'album',
  name: 'Test Album',
  coverArtUrl: 'album.jpg',
  artists: ['Test Artist'],
};

const mockSongs: Song[] = [
  {
    id: 'song1',
    title: 'First Song Title',
    artists: ['Test Artist'],
    album: 'Test Album 1',
    duration: 180,
    image: 'song1.jpg',
    url: 'song1.mp3',
  },
  {
    id: 'song2',
    title: 'Second Song Title',
    artists: ['Test Artist'],
    album: 'Test Album 2',
    duration: 200,
    image: 'song2.jpg',
    url: 'song2.mp3',
  },
];

const defaultPlayerState = {
  isPlaying: false,
  currentMusic: {
    itemInfo: null as ItemInfo | null,
    songsQueue: [] as Song[],
    song: null as Song | null,
    songIndex: 0,
  },
  setIsPlaying: jest.fn(),
  loadAndPlayMusic: jest.fn(),
  volume: 1,
  setVolume: jest.fn(),
  togglePlayPause: jest.fn(),
  playNextSong: jest.fn(),
  playPreviousSong: jest.fn(),
  clearPlayerState: jest.fn(),
  setSongsQueue: jest.fn(),
  setCurrentSongIndex: jest.fn(),
  setIsAutoplayEnabled: jest.fn(),
  isAutoplayEnabled: false,
};

const renderSongsTable = (songs: Song[], itemInfo: ItemInfo = mockItemInfo) => {
  mockUsePlayerStore.mockReturnValue(defaultPlayerState);
  return render(<SongsTable itemInfo={itemInfo} songs={songs} />);
};

describe('SongsTable Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (
      require('@fortawesome/react-fontawesome').FontAwesomeIcon as jest.Mock
    ).mockImplementation((props) => (
      <i data-testid={`icon-${props.icon.iconName}`}></i>
    ));
  });

  it('should render table headers and a SongInfo for each song', () => {
    renderSongsTable(mockSongs);

    expect(screen.getByText('#')).toBeInTheDocument();
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Album')).toBeInTheDocument();
    expect(screen.getByTestId(`icon-${faClock.iconName}`)).toBeInTheDocument();

    mockSongs.forEach((song) => {
      expect(screen.getByText(song.title)).toBeInTheDocument();
      expect(screen.getAllByText(song.album as string).length).toBeGreaterThan(
        0
      );
    });
  });

  it('should render table headers but no songs if songs array is empty', () => {
    renderSongsTable([]);

    expect(screen.getByText('#')).toBeInTheDocument();
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Album')).toBeInTheDocument();
    expect(screen.getByTestId(`icon-${faClock.iconName}`)).toBeInTheDocument();

    mockSongs.forEach((song) => {
      expect(screen.queryByText(song.title)).not.toBeInTheDocument();
    });
  });
});
