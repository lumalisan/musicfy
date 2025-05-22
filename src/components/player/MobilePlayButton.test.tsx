import { render, screen, fireEvent } from '@testing-library/react';
import {
  MobilePlayButton,
  type MobilePlayButtonProps,
} from './MobilePlayButton';
import { faPause, faPlay } from '@fortawesome/free-solid-svg-icons';

// Mock FontAwesomeIcon
jest.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: jest.fn((props) => (
    <i data-testid={`icon-${props.icon.iconName}`}></i>
  )),
}));

const renderMobilePlayButton = (props: Partial<MobilePlayButtonProps> = {}) => {
  const defaultProps: MobilePlayButtonProps = {
    isPlaying: false,
    onClick: jest.fn(),
    ...props,
  };
  return render(<MobilePlayButton {...defaultProps} />);
};

describe('MobilePlayButton Component', () => {
  beforeEach(() => {
    (
      require('@fortawesome/react-fontawesome').FontAwesomeIcon as jest.Mock
    ).mockClear();
  });

  it('should render play icon when isPlaying is false', () => {
    renderMobilePlayButton({ isPlaying: false });
    expect(screen.getByTestId(`icon-${faPlay.iconName}`)).toBeInTheDocument();
    expect(
      screen.queryByTestId(`icon-${faPause.iconName}`)
    ).not.toBeInTheDocument();
  });

  it('should render pause icon when isPlaying is true', () => {
    renderMobilePlayButton({ isPlaying: true });
    expect(screen.getByTestId(`icon-${faPause.iconName}`)).toBeInTheDocument();
    expect(
      screen.queryByTestId(`icon-${faPlay.iconName}`)
    ).not.toBeInTheDocument();
  });

  it('should call onClick handler when button is clicked', () => {
    const handleClick = jest.fn();
    renderMobilePlayButton({ onClick: handleClick });

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
