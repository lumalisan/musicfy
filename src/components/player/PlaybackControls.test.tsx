import { render, screen, fireEvent } from '@testing-library/react';
import {
  PlaybackControls,
  type PlaybackControlsProps,
} from './PlaybackControls';
import {
  faBackwardStep,
  faForwardStep,
  faPause,
  faPlay,
  faRepeat,
  faShuffle,
} from '@fortawesome/free-solid-svg-icons';

// Mock FontAwesomeIcon
jest.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: jest.fn((props) => (
    <i data-testid={`icon-${props.icon.iconName}`} data-size={props.size}></i>
  )),
}));

const defaultProps: PlaybackControlsProps = {
  isPlaying: false,
  isRandom: false,
  isRepeat: false,
  onPlayPause: jest.fn(),
  onNext: jest.fn(),
  onPrevious: jest.fn(),
  onToggleShuffle: jest.fn(),
  onToggleRepeat: jest.fn(),
};

const renderPlaybackControls = (props: Partial<PlaybackControlsProps> = {}) => {
  return render(<PlaybackControls {...defaultProps} {...props} />);
};

describe('PlaybackControls Component', () => {
  beforeEach(() => {
    const { FontAwesomeIcon } = require('@fortawesome/react-fontawesome') as {
      FontAwesomeIcon: jest.Mock;
    };
    FontAwesomeIcon.mockClear();
    if (
      typeof defaultProps.onPlayPause === 'function' &&
      'mockClear' in defaultProps.onPlayPause
    ) {
      (defaultProps.onPlayPause as jest.Mock).mockClear();
    }
    if (
      typeof defaultProps.onNext === 'function' &&
      'mockClear' in defaultProps.onNext
    ) {
      (defaultProps.onNext as jest.Mock).mockClear();
    }
    if (
      typeof defaultProps.onPrevious === 'function' &&
      'mockClear' in defaultProps.onPrevious
    ) {
      (defaultProps.onPrevious as jest.Mock).mockClear();
    }
    if (
      typeof defaultProps.onToggleShuffle === 'function' &&
      'mockClear' in defaultProps.onToggleShuffle
    ) {
      (defaultProps.onToggleShuffle as jest.Mock).mockClear();
    }
    if (
      typeof defaultProps.onToggleRepeat === 'function' &&
      'mockClear' in defaultProps.onToggleRepeat
    ) {
      (defaultProps.onToggleRepeat as jest.Mock).mockClear();
    }
  });

  // Play/Pause Button Tests
  describe('Play/Pause Button', () => {
    it('should render play icon and correct aria-label when not playing', () => {
      renderPlaybackControls({ isPlaying: false });
      expect(screen.getByTestId(`icon-${faPlay.iconName}`)).toBeInTheDocument();
      expect(screen.getByLabelText('Play')).toBeInTheDocument();
    });

    it('should render pause icon and correct aria-label when playing', () => {
      renderPlaybackControls({ isPlaying: true });
      expect(
        screen.getByTestId(`icon-${faPause.iconName}`)
      ).toBeInTheDocument();
      expect(screen.getByLabelText('Pause')).toBeInTheDocument();
    });

    it('should call onPlayPause when clicked', () => {
      renderPlaybackControls();
      fireEvent.click(screen.getByLabelText('Play'));
      expect(defaultProps.onPlayPause).toHaveBeenCalledTimes(1);
    });
  });

  // Previous Button Tests
  describe('Previous Button', () => {
    it('should render previous icon and correct aria-label', () => {
      renderPlaybackControls();
      expect(
        screen.getByTestId(`icon-${faBackwardStep.iconName}`)
      ).toBeInTheDocument();
      expect(screen.getByLabelText('Previous Track')).toBeInTheDocument();
    });

    it('should call onPrevious when clicked', () => {
      renderPlaybackControls();
      fireEvent.click(screen.getByLabelText('Previous Track'));
      expect(defaultProps.onPrevious).toHaveBeenCalledTimes(1);
    });
  });

  // Next Button Tests
  describe('Next Button', () => {
    it('should render next icon and correct aria-label', () => {
      renderPlaybackControls();
      expect(
        screen.getByTestId(`icon-${faForwardStep.iconName}`)
      ).toBeInTheDocument();
      expect(screen.getByLabelText('Next Track')).toBeInTheDocument();
    });

    it('should call onNext when clicked', () => {
      renderPlaybackControls();
      fireEvent.click(screen.getByLabelText('Next Track'));
      expect(defaultProps.onNext).toHaveBeenCalledTimes(1);
    });
  });

  // Shuffle Button Tests
  describe('Shuffle Button', () => {
    it('should render shuffle icon and correct aria-label when shuffle is off', () => {
      renderPlaybackControls({ isRandom: false });
      expect(
        screen.getByTestId(`icon-${faShuffle.iconName}`)
      ).toBeInTheDocument();
      expect(screen.getByLabelText('Enable Shuffle')).toBeInTheDocument();
      expect(screen.getByLabelText('Enable Shuffle')).not.toHaveClass(
        'text-accent'
      );
    });

    it('should render shuffle icon and correct aria-label when shuffle is on', () => {
      renderPlaybackControls({ isRandom: true });
      expect(
        screen.getByTestId(`icon-${faShuffle.iconName}`)
      ).toBeInTheDocument();
      expect(screen.getByLabelText('Disable Shuffle')).toBeInTheDocument();
      expect(screen.getByLabelText('Disable Shuffle')).toHaveClass(
        'text-accent'
      );
    });

    it('should call onToggleShuffle when clicked', () => {
      renderPlaybackControls();
      fireEvent.click(screen.getByLabelText('Enable Shuffle'));
      expect(defaultProps.onToggleShuffle).toHaveBeenCalledTimes(1);
    });
  });

  // Repeat Button Tests
  describe('Repeat Button', () => {
    it('should render repeat icon and correct aria-label when repeat is off', () => {
      renderPlaybackControls({ isRepeat: false });
      expect(
        screen.getByTestId(`icon-${faRepeat.iconName}`)
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText('Enable Repeat Current Song')
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText('Enable Repeat Current Song')
      ).not.toHaveClass('text-accent');
    });

    it('should render repeat icon and correct aria-label when repeat is on', () => {
      renderPlaybackControls({ isRepeat: true });
      expect(
        screen.getByTestId(`icon-${faRepeat.iconName}`)
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText('Disable Repeat Current Song')
      ).toBeInTheDocument();
      expect(screen.getByLabelText('Disable Repeat Current Song')).toHaveClass(
        'text-accent'
      );
    });

    it('should call onToggleRepeat when clicked', () => {
      renderPlaybackControls();
      fireEvent.click(screen.getByLabelText('Enable Repeat Current Song'));
      expect(defaultProps.onToggleRepeat).toHaveBeenCalledTimes(1);
    });
  });

  // largeIcons Prop Test
  describe('largeIcons Prop', () => {
    it('should pass size="lg" to icons when largeIcons is true', () => {
      renderPlaybackControls({ largeIcons: true });
      const icons = screen.getAllByTestId(/icon-/);
      icons.forEach((icon) => {
        expect(icon).toHaveAttribute('data-size', 'lg');
      });
    });

    it('should pass size=undefined (no data-size attr) to icons when largeIcons is false or undefined', () => {
      renderPlaybackControls({ largeIcons: false });
      let icons = screen.getAllByTestId(/icon-/);
      icons.forEach((icon) => {
        expect(icon).not.toHaveAttribute('data-size', 'lg');
        expect(icon.dataset.size).toBeUndefined();
      });

      const { FontAwesomeIcon } = require('@fortawesome/react-fontawesome') as {
        FontAwesomeIcon: jest.Mock;
      };
      FontAwesomeIcon.mockClear();
      renderPlaybackControls({});
      icons = screen.getAllByTestId(/icon-/);
      icons.forEach((icon) => {
        expect(icon.dataset.size).toBeUndefined();
      });
    });
  });
});
