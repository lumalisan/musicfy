import { render, screen, fireEvent } from '@testing-library/react';
import MobileExpandedPlayer, {
  type MobileExpandedPlayerProps,
} from './MobileExpandedPlayer';
import { faChevronDown, faEllipsisH } from '@fortawesome/free-solid-svg-icons';
import type { CurrentMusic } from '@/lib/types/CurrentMusic';

// Mock child components and dependencies
jest.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: jest.fn((props) => (
    <i data-testid={`icon-${props.icon.iconName}`} data-size={props.size}></i>
  )),
}));
jest.mock('./PlaybackControls', () => ({
  PlaybackControls: jest.fn(
    ({
      isPlaying,
      isRandom,
      isRepeat,
      onPlayPause,
      onNext,
      onPrevious,
      onToggleShuffle,
      onToggleRepeat,
      largeIcons,
      ...htmlDivProps
    }) => (
      <div data-testid='mock-playback-controls' {...htmlDivProps}>
        PlaybackControls (largeIcons: {String(largeIcons)}, isPlaying:{' '}
        {String(isPlaying)})
      </div>
    )
  ),
}));
jest.mock('./AudioController', () =>
  jest.fn(() => <div data-testid='mock-audio-controller'>AudioController</div>)
);
jest.mock('@/lib/utils/cn', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

const mockAudioRef = { current: null };

const defaultSong: CurrentMusic['song'] = {
  id: '1',
  title: 'Test Song',
  artists: ['Artist A', 'Artist B'],
  album: 'Test Album',
  duration: 180,
  image: 'test-image.jpg',
};

const defaultItemInfo: CurrentMusic['itemInfo'] = {
  id: 'album1',
  name: 'Test Album',
  color: 'rgb(255, 0, 0)',
  type: 'album',
};

const defaultProps: MobileExpandedPlayerProps = {
  currentMusic: {
    song: defaultSong,
    itemInfo: defaultItemInfo,
    songsQueue: [defaultSong],
  },
  isPlaying: false,
  isRandom: false,
  isRepeat: false,
  audioRef: mockAudioRef,
  onPlayPause: jest.fn(),
  onNext: jest.fn(),
  onPrevious: jest.fn(),
  onToggleShuffle: jest.fn(),
  onToggleRepeat: jest.fn(),
  onClose: jest.fn(),
  animationClassName: 'animate-slide-in',
};

const renderPlayer = (props: Partial<MobileExpandedPlayerProps> = {}) => {
  return render(<MobileExpandedPlayer {...defaultProps} {...props} />);
};

describe('MobileExpandedPlayer Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return null if currentMusic.song is not provided', () => {
    const { container } = renderPlayer({
      currentMusic: { ...defaultProps.currentMusic, song: undefined },
    });
    expect(container.firstChild).toBeNull();
  });

  it('should return null if currentMusic.itemInfo is not provided', () => {
    const { container } = renderPlayer({
      currentMusic: { ...defaultProps.currentMusic, itemInfo: undefined },
    });
    expect(container.firstChild).toBeNull();
  });

  describe('Basic Rendering and Prop Handling', () => {
    it('should render correctly with all props', () => {
      renderPlayer();
      expect(screen.getByLabelText('Minimize player')).toBeInTheDocument();
      expect(
        screen.getByTestId(`icon-${faChevronDown.iconName}`)
      ).toBeInTheDocument();
      expect(screen.getByLabelText('More options')).toBeInTheDocument();
      expect(
        screen.getByTestId(`icon-${faEllipsisH.iconName}`)
      ).toBeInTheDocument();
      expect(screen.getByText(defaultSong.album!)).toBeInTheDocument();
      expect(
        screen.getByAltText(`Cover for ${defaultSong.title}`)
      ).toHaveAttribute('src', defaultSong.image);
      expect(screen.getByText(defaultSong.title!)).toBeInTheDocument();
      expect(
        screen.getByText(defaultSong.artists!.join(', '))
      ).toBeInTheDocument();
      expect(screen.getByTestId('mock-audio-controller')).toBeInTheDocument();
      expect(screen.getByTestId('mock-playback-controls')).toBeInTheDocument();
    });

    it('should apply background color from itemInfo.color', () => {
      const { container } = renderPlayer();
      expect(container.firstChild).toHaveStyle(
        `background-color: ${defaultItemInfo.color}`
      );
    });

    it('should not apply background color if itemInfo.color is undefined', () => {
      const { container } = renderPlayer({
        currentMusic: {
          ...defaultProps.currentMusic,
          itemInfo: { ...defaultItemInfo, color: undefined },
        },
      });
      expect((container.firstChild as HTMLElement).style.backgroundColor).toBe(
        ''
      );
    });

    it('should apply animationClassName', () => {
      const { container } = renderPlayer({
        animationClassName: 'custom-animation',
      });
      expect(container.firstChild).toHaveClass('custom-animation');
    });

    it('should not apply animationClassName if undefined', () => {
      const { container } = renderPlayer({ animationClassName: undefined });
      expect(container.firstChild).toHaveClass(
        'bg-secondary fixed inset-0 z-50 flex flex-col p-4 pt-6 antialiased'
      );
      expect(container.firstChild?.toString()).not.toContain('undefined');
    });
  });

  describe('Placeholder Values', () => {
    it('should display "Now Playing" if song.album is null', () => {
      renderPlayer({
        currentMusic: {
          ...defaultProps.currentMusic,
          song: { ...defaultSong, album: null },
        },
      });
      expect(screen.getByText('Now Playing')).toBeInTheDocument();
    });

    it('should use placeholder image if song.image is null', () => {
      renderPlayer({
        currentMusic: {
          ...defaultProps.currentMusic,
          song: { ...defaultSong, image: null },
        },
      });
      expect(
        screen.getByAltText(`Cover for ${defaultSong.title}`)
      ).toHaveAttribute('src', '/placeholder-album-art.png');
    });

    it('should display "Unknown Title" and update image alt text if song.title is null', () => {
      renderPlayer({
        currentMusic: {
          ...defaultProps.currentMusic,
          song: { ...defaultSong, title: 'Initial Song Title' },
        },
      });
      expect(
        screen.getByAltText('Cover for Initial Song Title')
      ).toBeInTheDocument();

      renderPlayer({
        currentMusic: {
          ...defaultProps.currentMusic,
          song: { ...defaultSong, title: 'Unknown Title' },
        },
      });
      expect(screen.getByText('Unknown Title')).toBeInTheDocument();
      expect(
        screen.getByAltText('Cover for Unknown Title')
      ).toBeInTheDocument();
    });

    it('should display "Unknown Artist" if song.artists is null', () => {
      renderPlayer({
        currentMusic: {
          ...defaultProps.currentMusic,
          song: { ...defaultSong, artists: [] },
        },
      });
      expect(screen.getByText('Unknown Artist')).toBeInTheDocument();
    });

    it('should display "Unknown Artist" if song.artists is an empty array', () => {
      renderPlayer({
        currentMusic: {
          ...defaultProps.currentMusic,
          song: { ...defaultSong, artists: [] },
        },
      });
      expect(screen.getByText('Unknown Artist')).toBeInTheDocument();
    });
  });

  describe('Callbacks', () => {
    it('should call onClose when minimize button is clicked', () => {
      renderPlayer();
      fireEvent.click(screen.getByLabelText('Minimize player'));
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Prop Propagation to Child Components', () => {
    it('should pass audioRef to AudioController', () => {
      const MockAudioController = require('./AudioController') as jest.Mock;
      renderPlayer();
      expect(MockAudioController.mock.calls.length).toBeGreaterThan(0);
      expect(
        MockAudioController.mock.calls[
          MockAudioController.mock.calls.length - 1
        ][0]
      ).toEqual(expect.objectContaining({ audioRef: mockAudioRef }));
    });

    it('should pass correct props to PlaybackControls', () => {
      const MockPlaybackControls = require('./PlaybackControls')
        .PlaybackControls as jest.Mock;
      const specificProps = {
        isPlaying: true,
        isRandom: true,
        isRepeat: true,
        onPlayPause: jest.fn(),
        onNext: jest.fn(),
        onPrevious: jest.fn(),
        onToggleShuffle: jest.fn(),
        onToggleRepeat: jest.fn(),
      };
      renderPlayer(specificProps);
      expect(MockPlaybackControls.mock.calls.length).toBeGreaterThan(0);
      const lastCallProps =
        MockPlaybackControls.mock.calls[
          MockPlaybackControls.mock.calls.length - 1
        ][0];
      expect(lastCallProps).toEqual(
        expect.objectContaining({
          isPlaying: specificProps.isPlaying,
          isRandom: specificProps.isRandom,
          isRepeat: specificProps.isRepeat,
          onPlayPause: specificProps.onPlayPause,
          onNext: specificProps.onNext,
          onPrevious: specificProps.onPrevious,
          onToggleShuffle: specificProps.onToggleShuffle,
          onToggleRepeat: specificProps.onToggleRepeat,
          largeIcons: true,
        })
      );
    });
  });
});
