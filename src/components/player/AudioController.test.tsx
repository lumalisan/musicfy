import { render, screen, fireEvent } from '@testing-library/react';
import AudioController from './AudioController';
import { useAudioTime } from '@/hooks/useAudioTime';
import { formatDuration } from '@/lib/utils/formatDuration';

// Mock dependencies
jest.mock('@/hooks/useAudioTime');
jest.mock('@/lib/utils/formatDuration');
jest.mock('../shared/Slider', () => ({
  Slider: jest.fn(
    ({ onValueChange, value, max, min, defaultValue, className }) => (
      <div data-testid='mock-slider'>
        <input
          type='range'
          min={min}
          max={max}
          value={value?.[0] ?? defaultValue?.[0] ?? 0}
          onChange={(e) => onValueChange([parseFloat(e.target.value)])}
          data-testid='mock-slider-input'
        />
        <span data-testid='slider-value'>{value?.[0]}</span>
        <span data-testid='slider-max'>{max}</span>
        <span data-testid='slider-classname'>{className}</span>
      </div>
    )
  ),
}));

const mockUseAudioTime = useAudioTime as jest.Mock;
const mockFormatDuration = formatDuration as jest.Mock;

const mockAudioRef = {
  current: {
    currentTime: 0,
  } as HTMLAudioElement,
};

const mockAudioRefNull = {
  current: null,
};

describe('AudioController Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFormatDuration.mockImplementation((time) => `formatted-${time}`);
  });

  it('should render initial times and slider with correct props', () => {
    mockUseAudioTime.mockReturnValue({ currentTime: 10, audioDuration: 100 });
    render(<AudioController audioRef={mockAudioRef} />);

    expect(mockFormatDuration).toHaveBeenCalledWith(10);
    expect(mockFormatDuration).toHaveBeenCalledWith(100);
    expect(screen.getAllByText('formatted-10').length).toBeGreaterThanOrEqual(
      1
    );
    expect(screen.getAllByText('formatted-100').length).toBeGreaterThanOrEqual(
      1
    );

    // Check Slider props
    const slider = screen.getByTestId('mock-slider');
    expect(slider).toBeInTheDocument();
    expect(screen.getByTestId('slider-value').textContent).toBe('10');
    expect(screen.getByTestId('slider-max').textContent).toBe('100');
  });

  it('should update audioRef.currentTime when slider value changes', () => {
    mockUseAudioTime.mockReturnValue({ currentTime: 10, audioDuration: 100 });
    render(<AudioController audioRef={mockAudioRef} />);

    const sliderInput = screen.getByTestId('mock-slider-input');
    fireEvent.change(sliderInput, { target: { value: '30' } });

    expect(mockAudioRef.current.currentTime).toBe(30);
  });

  it('should not throw error if audioRef.current is null when slider changes', () => {
    mockUseAudioTime.mockReturnValue({ currentTime: 10, audioDuration: 100 });
    render(<AudioController audioRef={mockAudioRefNull as any} />);

    const sliderInput = screen.getByTestId('mock-slider-input');
    expect(() => {
      fireEvent.change(sliderInput, { target: { value: '30' } });
    }).not.toThrow();
  });

  it('should update display and slider when useAudioTime provides new values', () => {
    const { rerender } = render(<AudioController audioRef={mockAudioRef} />);
    mockUseAudioTime.mockReturnValue({ currentTime: 10, audioDuration: 100 });
    rerender(<AudioController audioRef={mockAudioRef} />);

    mockFormatDuration.mockClear();

    mockUseAudioTime.mockReturnValue({ currentTime: 25, audioDuration: 120 });
    rerender(<AudioController audioRef={mockAudioRef} />);

    expect(mockFormatDuration).toHaveBeenCalledWith(25);
    expect(mockFormatDuration).toHaveBeenCalledWith(120);
    expect(screen.getAllByText('formatted-25').length).toBeGreaterThanOrEqual(
      1
    );
    expect(screen.getAllByText('formatted-120').length).toBeGreaterThanOrEqual(
      1
    );

    expect(screen.getByTestId('slider-value').textContent).toBe('25');
    expect(screen.getByTestId('slider-max').textContent).toBe('120');
  });
});
