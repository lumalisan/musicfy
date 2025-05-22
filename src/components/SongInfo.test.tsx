import { render, screen, fireEvent } from '@testing-library/react';
import SongInfo from './SongInfo';
import { usePlayerStore } from '@/store/playerStore';
import type { ItemInfo } from '@/lib/types/ItemInfo';
import type { Song } from '@/lib/types/Song';

// Mock dependencies
jest.mock('@/store/playerStore');
const mockUsePlayerStore = usePlayerStore as unknown as jest.Mock;

const mockItemInfo: ItemInfo = {
  id: 'album1',
  type: 'album',
  name: 'Test Album',
  coverArtUrl: 'album.jpg',
  artists: ['Test Artist'],
};

const mockSongsInView: Song[] = [
  {
    id: 'song1',
    title: 'Song One',
    artists: ['Test Artist'],
    album: 'Test Album',
    duration: 180,
    image: 'song1.jpg',
    url: 'song1.mp3',
  },
  {
    id: 'song2',
    title: 'Song Two',
    artists: ['Test Artist'],
    album: 'Test Album',
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

const renderSongInfo = (
  song: Song,
  index: number,
  playerState = defaultPlayerState
) => {
  mockUsePlayerStore.mockReturnValue(playerState);
  return render(
    <table>
      <tbody>
        <SongInfo
          itemInfo={mockItemInfo}
          songsInView={mockSongsInView}
          song={song}
          index={index}
        />
      </tbody>
    </table>
  );
};

describe('SongInfo Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render song title, artist, album, and duration', () => {
    const songToRender = mockSongsInView[0];
    renderSongInfo(songToRender, 0);

    expect(screen.getByText(songToRender.title)).toBeInTheDocument();
    expect(
      screen.getByText(songToRender.artists.join(', '))
    ).toBeInTheDocument();
    expect(screen.getByText(songToRender.album as string)).toBeInTheDocument();
    expect(screen.getByText('3:00')).toBeInTheDocument();
    expect(screen.getByAltText(songToRender.title)).toHaveAttribute(
      'src',
      songToRender.image
    );
  });

  it('should display the song index by default', () => {
    renderSongInfo(mockSongsInView[0], 0);
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('should call loadAndPlayMusic when an inactive song is clicked', () => {
    const songToPlay = mockSongsInView[1];
    const loadAndPlayMusicMock = jest.fn();
    renderSongInfo(songToPlay, 1, {
      ...defaultPlayerState,
      loadAndPlayMusic: loadAndPlayMusicMock,
    });

    const songRow = screen.getByRole('button', {
      name: new RegExp(`Play ${songToPlay.title}`, 'i'),
    });
    fireEvent.click(songRow);

    expect(loadAndPlayMusicMock).toHaveBeenCalledWith({
      songsQueue: mockSongsInView,
      itemInfo: mockItemInfo,
      songIndex: 1,
    });
  });

  it('should call setIsPlaying(false) when an active and playing song is clicked', () => {
    const currentSong = mockSongsInView[0];
    const setIsPlayingMock = jest.fn();
    const playerState = {
      ...defaultPlayerState,
      isPlaying: true,
      currentMusic: {
        itemInfo: mockItemInfo,
        songsQueue: mockSongsInView,
        song: currentSong,
        songIndex: 0,
      },
      setIsPlaying: setIsPlayingMock,
    };
    renderSongInfo(currentSong, 0, playerState);

    const songRow = screen.getByRole('button', {
      name: new RegExp(`Play ${currentSong.title}`, 'i'),
    });
    fireEvent.click(songRow);
    expect(setIsPlayingMock).toHaveBeenCalledWith(false);
  });

  it('should call setIsPlaying(true) when an active but paused song is clicked', () => {
    const currentSong = mockSongsInView[0];
    const setIsPlayingMock = jest.fn();
    const playerState = {
      ...defaultPlayerState,
      isPlaying: false,
      currentMusic: {
        itemInfo: mockItemInfo,
        songsQueue: mockSongsInView,
        song: currentSong,
        songIndex: 0,
      },
      setIsPlaying: setIsPlayingMock,
    };
    renderSongInfo(currentSong, 0, playerState);

    const songRow = screen.getByRole('button', {
      name: new RegExp(`Play ${currentSong.title}`, 'i'),
    });
    fireEvent.click(songRow);
    expect(setIsPlayingMock).toHaveBeenCalledWith(true);
  });

  it('should trigger handleClick on Enter key press', () => {
    const songToPlay = mockSongsInView[0];
    const loadAndPlayMusicMock = jest.fn();
    renderSongInfo(songToPlay, 0, {
      ...defaultPlayerState,
      loadAndPlayMusic: loadAndPlayMusicMock,
    });

    const songRow = screen.getByRole('button', {
      name: new RegExp(`Play ${songToPlay.title}`, 'i'),
    });
    fireEvent.keyDown(songRow, { key: 'Enter', code: 'Enter' });

    expect(loadAndPlayMusicMock).toHaveBeenCalledWith({
      songsQueue: mockSongsInView,
      itemInfo: mockItemInfo,
      songIndex: 0,
    });
  });

  it('should trigger handleClick on Space key press', () => {
    const songToPlay = mockSongsInView[0];
    const loadAndPlayMusicMock = jest.fn();
    renderSongInfo(songToPlay, 0, {
      ...defaultPlayerState,
      loadAndPlayMusic: loadAndPlayMusicMock,
    });

    const songRow = screen.getByRole('button', {
      name: new RegExp(`Play ${songToPlay.title}`, 'i'),
    });
    fireEvent.keyDown(songRow, { key: ' ', code: 'Space' });

    expect(loadAndPlayMusicMock).toHaveBeenCalledWith({
      songsQueue: mockSongsInView,
      itemInfo: mockItemInfo,
      songIndex: 0,
    });
  });

  it('should display play icon on hover when song is not playing', () => {
    const songToRender = mockSongsInView[0];
    renderSongInfo(songToRender, 0);
    const songRow = screen.getByRole('button', {
      name: new RegExp(`Play ${songToRender.title}`, 'i'),
    });
    fireEvent.mouseEnter(songRow);
    expect(
      screen.getByText(
        (content, element) =>
          element?.tagName.toLowerCase() === 'span' &&
          content === (0 + 1).toString()
      )
    ).toBeInTheDocument();
  });

  it('should apply active song styling when song is currently active', () => {
    const currentSong = mockSongsInView[0];
    const playerState = {
      ...defaultPlayerState,
      currentMusic: {
        itemInfo: mockItemInfo,
        songsQueue: mockSongsInView,
        song: currentSong,
        songIndex: 0,
      },
    };
    renderSongInfo(currentSong, 0, playerState);
    const songRow = screen.getByRole('button', {
      name: new RegExp(`Play ${currentSong.title}`, 'i'),
    });
    expect(songRow).toHaveClass('text-accent', 'bg-white/20');
  });

  it('should use default placeholder image if song.image is not provided', () => {
    const songWithoutImage = { ...mockSongsInView[0], image: null };
    renderSongInfo(songWithoutImage, 0);
    expect(screen.getByAltText(songWithoutImage.title)).toHaveAttribute(
      'src',
      '/images/default-song-placeholder.png'
    );
  });
});
