import { render, screen, fireEvent, act } from '@testing-library/react';
import VolumeController from './VolumeController';
import { usePlayerStore } from '@/store/playerStore';
import {
  faVolumeHigh,
  faVolumeLow,
  faVolumeXmark,
} from '@fortawesome/free-solid-svg-icons';

// Mock dependencies
jest.mock('@/store/playerStore');
jest.mock('../shared/Slider', () => ({
  Slider: jest.fn(({ onValueChange, value, max, min, step, defaultValue }) => (
    <div data-testid='mock-slider'>
      <input
        type='range'
        min={min}
        max={max}
        step={step}
        value={value?.[0] ?? defaultValue?.[0] ?? 0}
        onChange={(e) => onValueChange([parseFloat(e.target.value)])}
        data-testid='mock-slider-input'
      />
      <span data-testid='slider-value'>{value?.[0]}</span>
    </div>
  )),
}));
jest.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: jest.fn((props) => (
    <i data-testid={`icon-${props.icon.iconName}`}></i>
  )),
}));

const mockUsePlayerStore = usePlayerStore as unknown as jest.Mock;
let mockVolume = 1;
const mockSetVolume = jest.fn();

// Helper to set up the mock store state for each test
const setupMockStore = (currentVolume: number) => {
  mockVolume = currentVolume;
  mockUsePlayerStore.mockImplementation((selector) => {
    const state = {
      volume: mockVolume,
      setVolume: mockSetVolume,
    };
    return selector(state);
  });
};

describe('VolumeController Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupMockStore(1);
  });

  it('should render high volume icon and slider with initial volume', () => {
    render(<VolumeController />);
    expect(
      screen.getByTestId(`icon-${faVolumeHigh.iconName}`)
    ).toBeInTheDocument();
    expect(screen.getByTestId('slider-value').textContent).toBe('1');
  });

  it('should render low volume icon when volume is < 0.5 and > 0', () => {
    setupMockStore(0.3);
    render(<VolumeController />);
    expect(
      screen.getByTestId(`icon-${faVolumeLow.iconName}`)
    ).toBeInTheDocument();
  });

  it('should render muted icon when volume is 0', () => {
    setupMockStore(0);
    render(<VolumeController />);
    expect(
      screen.getByTestId(`icon-${faVolumeXmark.iconName}`)
    ).toBeInTheDocument();
  });

  it('should call setVolume when slider value changes', () => {
    render(<VolumeController />);
    const sliderInput = screen.getByTestId('mock-slider-input');
    fireEvent.change(sliderInput, { target: { value: '0.75' } });
    expect(mockSetVolume).toHaveBeenCalledWith(0.75);
  });

  describe('Mute/Unmute functionality', () => {
    it('should mute volume (set to 0) when icon is clicked and volume > 0', () => {
      setupMockStore(0.8);
      render(<VolumeController />);
      const volumeButton = screen.getByRole('button');
      fireEvent.click(volumeButton);
      expect(mockSetVolume).toHaveBeenCalledWith(0);
    });

    it('should unmute to previousVolume (default 1) when icon is clicked and volume is 0', () => {
      setupMockStore(0);
      render(<VolumeController />);
      const volumeButton = screen.getByRole('button');
      fireEvent.click(volumeButton);
      expect(mockSetVolume).toHaveBeenCalledWith(1);
    });

    it('should unmute to the actual previous volume if muted after volume change', () => {
      // 1. Set initial volume and render
      setupMockStore(0.6);
      const { rerender } = render(<VolumeController />);
      const volumeButton = screen.getByRole('button');

      // 2. Click to mute (stores 0.6 as previousVolume internally)
      act(() => {
        fireEvent.click(volumeButton);
      });
      // setVolume(0) was called, now simulate store update
      setupMockStore(0);
      rerender(<VolumeController />);

      // 3. Click to unmute
      act(() => {
        fireEvent.click(volumeButton);
      });
      expect(mockSetVolume).toHaveBeenCalledWith(0.6);
    });
  });

  it('should update icon and slider when volume changes in store', () => {
    const { rerender } = render(<VolumeController />);
    expect(
      screen.getByTestId(`icon-${faVolumeHigh.iconName}`)
    ).toBeInTheDocument();
    expect(screen.getByTestId('slider-value').textContent).toBe('1');

    // Simulate store update
    setupMockStore(0.2);
    rerender(<VolumeController />);

    expect(
      screen.getByTestId(`icon-${faVolumeLow.iconName}`)
    ).toBeInTheDocument();
    expect(screen.getByTestId('slider-value').textContent).toBe('0.2');

    setupMockStore(0);
    rerender(<VolumeController />);
    expect(
      screen.getByTestId(`icon-${faVolumeXmark.iconName}`)
    ).toBeInTheDocument();
    expect(screen.getByTestId('slider-value').textContent).toBe('0');
  });
});
