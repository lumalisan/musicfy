import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LoadingSearch } from './LoadingSearch';

describe('LoadingSearch component', () => {
  it('should render the loading spinner and text', () => {
    render(<LoadingSearch />);

    expect(screen.getByText('Searching...')).toBeInTheDocument();
    const spinnerIcon = screen.getByRole('img', { hidden: true });
    expect(spinnerIcon).toBeInTheDocument();
    expect(spinnerIcon).toHaveClass('fa-spinner');
    expect(spinnerIcon).toHaveClass('animate-spin');
  });

  it('should have the correct FontAwesomeIcon properties', () => {
    render(<LoadingSearch />);
    const iconElement = document.querySelector('svg[data-icon="spinner"]');
    expect(iconElement).toBeInTheDocument();
  });
});
