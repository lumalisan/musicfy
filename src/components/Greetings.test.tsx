import { render, screen } from '@testing-library/react';
import Greetings from './Greetings';

describe('Greetings Component', () => {
  const originalDate = Date;

  afterEach(() => {
    global.Date = originalDate;
  });

  it('should render "Good Morning" before 12 PM', () => {
    // Mock Date to return a time in the morning (e.g., 9 AM)
    const mockDate = new Date(2023, 10, 20, 9, 0, 0);
    global.Date = class extends originalDate {
      constructor() {
        super();
        return mockDate;
      }
    } as any;

    render(<Greetings />);
    expect(screen.getByText('Good Morning')).toBeInTheDocument();
  });

  it('should render "Good Afternoon" between 12 PM and 6 PM (exclusive)', () => {
    // Mock Date to return a time in the afternoon (e.g., 2 PM)
    const mockDate = new Date(2023, 10, 20, 14, 0, 0);
    global.Date = class extends originalDate {
      constructor() {
        super();
        return mockDate;
      }
    } as any;

    render(<Greetings />);
    expect(screen.getByText('Good Afternoon')).toBeInTheDocument();
  });

  it('should render "Good Night" from 6 PM onwards', () => {
    // Mock Date to return a time in the evening/night (e.g., 8 PM)
    const mockDate = new Date(2023, 10, 20, 20, 0, 0);
    global.Date = class extends originalDate {
      constructor() {
        super();
        return mockDate;
      }
    } as any;

    render(<Greetings />);
    // The component logic uses 'Good Night' for hours >= 18
    expect(screen.getByText('Good Night')).toBeInTheDocument();
  });
});
