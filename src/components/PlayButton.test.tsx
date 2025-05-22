import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PlayButton from './PlayButton';
import { usePlayerStore } from '@/store/playerStore';
import { playbackRepository } from '@/lib/repositories';
import { AppError, ErrorCode } from '@/lib/utils/errorHandling';

// Mock dependencies
jest.mock('@/store/playerStore');
jest.mock('@/lib/repositories');

const mockUsePlayerStore = usePlayerStore as unknown as jest.Mock;
const mockPlaybackRepository = playbackRepository as jest.Mocked<
  typeof playbackRepository
>;

// Mock console methods
const mockConsoleWarn = jest
  .spyOn(console, 'warn')
  .mockImplementation(() => {});
const mockConsoleError = jest
  .spyOn(console, 'error')
  .mockImplementation(() => {});

const defaultPlayerState = {
  isPlaying: false,
  currentMusic: {
    itemInfo: null,
    songsQueue: [],
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

describe('PlayButton Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePlayerStore.mockReturnValue(defaultPlayerState);
  });

  it('should render with default props and show play icon', () => {
    render(<PlayButton itemId='test-album-1' itemType='album' />);
    expect(
      screen.getByLabelText('Play album test-album-1')
    ).toBeInTheDocument();
  });

  it('should apply large size styles when size prop is "large"', () => {
    render(
      <PlayButton itemId='test-playlist-1' itemType='playlist' size='large' />
    );
    const button = screen.getByLabelText('Play playlist test-playlist-1');
    expect(button).toHaveClass('h-14 w-14 text-2xl');
  });

  it('should show pause icon and correct aria-label when item is currently playing', () => {
    mockUsePlayerStore.mockReturnValue({
      ...defaultPlayerState,
      isPlaying: true,
      currentMusic: {
        itemInfo: { id: 'test-album-1', type: 'album' },
        songsQueue: [{ id: 'song1' }],
        songIndex: 0,
      },
    });
    render(<PlayButton itemId='test-album-1' itemType='album' />);
    expect(
      screen.getByLabelText('Pause album test-album-1')
    ).toBeInTheDocument();
  });

  it('should call setIsPlaying(false) when pause icon is clicked', () => {
    const setIsPlayingMock = jest.fn();
    mockUsePlayerStore.mockReturnValue({
      ...defaultPlayerState,
      isPlaying: true,
      currentMusic: {
        itemInfo: { id: 'test-album-1', type: 'album' },
        songsQueue: [{ id: 'song1' }],
        songIndex: 0,
      },
      setIsPlaying: setIsPlayingMock,
    });

    render(<PlayButton itemId='test-album-1' itemType='album' />);
    const pauseButton = screen.getByLabelText('Pause album test-album-1');
    fireEvent.click(pauseButton);
    expect(setIsPlayingMock).toHaveBeenCalledWith(false);
  });

  it('should call setIsPlaying(true) when play icon is clicked for a currently loaded but paused item', () => {
    const setIsPlayingMock = jest.fn();
    mockUsePlayerStore.mockReturnValue({
      ...defaultPlayerState,
      isPlaying: false,
      currentMusic: {
        itemInfo: { id: 'test-album-1', type: 'album' },
        songsQueue: [{ id: 'song1' }],
        songIndex: 0,
      },
      setIsPlaying: setIsPlayingMock,
    });

    render(<PlayButton itemId='test-album-1' itemType='album' />);
    const playButton = screen.getByLabelText('Play album test-album-1');
    fireEvent.click(playButton);
    expect(setIsPlayingMock).toHaveBeenCalledWith(true);
  });

  it('should fetch details and play music when a new item is clicked', async () => {
    const loadAndPlayMusicMock = jest.fn();
    mockUsePlayerStore.mockReturnValue({
      ...defaultPlayerState,
      loadAndPlayMusic: loadAndPlayMusicMock,
    });

    const mockSongs = [{ id: 'song1', title: 'Song 1' }];
    const mockItemDetails = {
      id: 'test-album-new',
      type: 'album',
      name: 'New Album',
      artists: [{ id: 'artist1', name: 'Artist 1' }],
    };
    mockPlaybackRepository.getPlaybackDetails.mockResolvedValueOnce({
      songs: mockSongs as any,
      itemDetails: mockItemDetails as any,
    });

    render(<PlayButton itemId='test-album-new' itemType='album' />);
    const playButton = screen.getByLabelText('Play album test-album-new');
    fireEvent.click(playButton);

    await waitFor(() => {
      expect(playbackRepository.getPlaybackDetails).toHaveBeenCalledWith(
        '',
        'test-album-new',
        'album'
      );
    });
    await waitFor(() => {
      expect(loadAndPlayMusicMock).toHaveBeenCalledWith({
        songsQueue: mockSongs,
        itemInfo: {
          ...mockItemDetails,
          artists: mockItemDetails.artists,
        },
        songIndex: 0,
      });
    });
  });

  it('should log a warning if no songs are found for the item', async () => {
    mockPlaybackRepository.getPlaybackDetails.mockResolvedValueOnce({
      songs: [],
      itemDetails: {
        id: 'test-album-empty',
        type: 'album',
        name: 'Empty Album',
      } as any,
    });

    render(<PlayButton itemId='test-album-empty' itemType='album' />);
    const playButton = screen.getByLabelText('Play album test-album-empty');
    fireEvent.click(playButton);

    await waitFor(() => {
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        'No songs found in album with id:',
        'test-album-empty'
      );
    });
    expect(defaultPlayerState.loadAndPlayMusic).not.toHaveBeenCalled();
  });

  it('should log an AppError if fetching playback details fails with AppError', async () => {
    const appError = new AppError('API Error', ErrorCode.SERVER_ERROR, 500, {
      detail: 'Server down',
    });
    mockPlaybackRepository.getPlaybackDetails.mockRejectedValueOnce(appError);

    render(<PlayButton itemId='test-album-fail' itemType='album' />);
    const playButton = screen.getByLabelText('Play album test-album-fail');
    fireEvent.click(playButton);

    await waitFor(() => {
      expect(mockConsoleError).toHaveBeenCalledWith(
        `Error fetching playback details for album test-album-fail (Code: ${appError.code}, Status: ${appError.statusCode}): ${appError.message}`,
        appError.details
      );
    });
    expect(defaultPlayerState.loadAndPlayMusic).not.toHaveBeenCalled();
  });

  it('should log a generic error if fetching playback details fails with a non-AppError', async () => {
    const genericError = new Error('Network Error');
    mockPlaybackRepository.getPlaybackDetails.mockRejectedValueOnce(
      genericError
    );

    render(<PlayButton itemId='test-album-generic-fail' itemType='album' />);
    const playButton = screen.getByLabelText(
      'Play album test-album-generic-fail'
    );
    fireEvent.click(playButton);

    await waitFor(() => {
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Error fetching and playing album with id test-album-generic-fail:',
        genericError.message
      );
    });
    expect(defaultPlayerState.loadAndPlayMusic).not.toHaveBeenCalled();
  });

  it('should correctly handle itemDetails with null artists when fetching details', async () => {
    const loadAndPlayMusicMock = jest.fn();
    mockUsePlayerStore.mockReturnValue({
      ...defaultPlayerState,
      loadAndPlayMusic: loadAndPlayMusicMock,
    });

    const mockSongs = [{ id: 'song1', title: 'Song 1' }];
    const mockItemDetails = {
      id: 'test-album-null-artists',
      type: 'album',
      name: 'Null Artists Album',
      artists: null,
    };
    mockPlaybackRepository.getPlaybackDetails.mockResolvedValueOnce({
      songs: mockSongs as any,
      itemDetails: mockItemDetails as any,
    });

    render(<PlayButton itemId='test-album-null-artists' itemType='album' />);
    fireEvent.click(
      screen.getByLabelText('Play album test-album-null-artists')
    );

    await waitFor(() => {
      expect(loadAndPlayMusicMock).toHaveBeenCalledWith(
        expect.objectContaining({
          itemInfo: expect.objectContaining({
            artists: undefined,
          }),
        })
      );
    });
  });

  it('should log a generic error message if the error object has no message property', async () => {
    const errorWithoutMessage = { code: 'UNEXPECTED_ERROR' };
    mockPlaybackRepository.getPlaybackDetails.mockRejectedValueOnce(
      errorWithoutMessage
    );

    render(<PlayButton itemId='test-album-no-msg-fail' itemType='album' />);
    fireEvent.click(screen.getByLabelText('Play album test-album-no-msg-fail'));

    await waitFor(() => {
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Error fetching and playing album with id test-album-no-msg-fail:',
        errorWithoutMessage
      );
    });
    expect(defaultPlayerState.loadAndPlayMusic).not.toHaveBeenCalled();
  });
});
