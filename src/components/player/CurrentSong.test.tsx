import { render, screen } from '@testing-library/react';
import CurrentSong from './CurrentSong';

describe('CurrentSong Component', () => {
  it('should render song details when all props are provided', () => {
    const props = {
      image: 'test-image.jpg',
      title: 'Test Song Title',
      artists: ['Artist One', 'Artist Two'],
    };
    render(<CurrentSong {...props} />);

    const imgElement = screen.getByAltText(props.title) as HTMLImageElement;
    expect(imgElement).toBeInTheDocument();
    expect(imgElement.src).toContain(props.image);

    expect(screen.getByText(props.title)).toBeInTheDocument();
    expect(screen.getByText('Artist One, Artist Two')).toBeInTheDocument();
  });

  it('should render correctly when image is not provided', () => {
    const props = {
      title: 'Test Song Title No Image',
      artists: ['Artist One'],
    };
    render(<CurrentSong {...props} />);

    const imgElement = screen.getByAltText(props.title) as HTMLImageElement;
    expect(imgElement).toBeInTheDocument();
    expect(imgElement.src).toBe('');

    expect(screen.getByText(props.title)).toBeInTheDocument();
    expect(screen.getByText('Artist One')).toBeInTheDocument();
  });

  it('should render correctly when title is not provided', () => {
    const props = {
      image: 'test-image-no-title.jpg',
      artists: ['Artist Three'],
    };
    render(<CurrentSong {...props} />);

    const imgElement = screen.getByRole('img') as HTMLImageElement;
    expect(imgElement).toBeInTheDocument();
    expect(imgElement.src).toContain(props.image);
    const titleElement = screen.queryByRole('heading', { level: 3 });
    expect(titleElement?.textContent).toBe('');

    expect(screen.getByText('Artist Three')).toBeInTheDocument();
  });

  it('should render correctly when artists array is not provided', () => {
    const props = {
      image: 'test-image-no-artists.jpg',
      title: 'Test Song No Artists',
    };
    render(<CurrentSong {...props} />);

    const imgElement = screen.getByAltText(props.title) as HTMLImageElement;
    expect(imgElement).toBeInTheDocument();
    expect(imgElement.src).toContain(props.image);
    expect(screen.getByText(props.title)).toBeInTheDocument();

    const artistsSpan = screen
      .getByText(props.title)
      .closest('div')
      ?.querySelector('span');
    expect(artistsSpan).toBeInTheDocument();
    expect(artistsSpan?.textContent).toBe('');
  });

  it('should render correctly when artists array is empty', () => {
    const props = {
      image: 'test-image-empty-artists.jpg',
      title: 'Test Song Empty Artists',
      artists: [],
    };
    render(<CurrentSong {...props} />);

    const imgElement = screen.getByAltText(props.title) as HTMLImageElement;
    expect(imgElement).toBeInTheDocument();
    expect(imgElement.src).toContain(props.image);
    expect(screen.getByText(props.title)).toBeInTheDocument();

    const artistsSpan = screen
      .getByText(props.title)
      .closest('div')
      ?.querySelector('span');
    expect(artistsSpan).toBeInTheDocument();
    expect(artistsSpan?.textContent).toBe('');
  });

  it('should render correctly when all optional props are missing', () => {
    render(<CurrentSong />);

    const imgElement = screen.getByRole('img') as HTMLImageElement;
    expect(imgElement).toBeInTheDocument();
    expect(imgElement.alt).toBe('');
    expect(imgElement.src).toBe('');

    const titleElement = screen.queryByRole('heading', { level: 3 });
    expect(titleElement?.textContent).toBe('');

    const mainDiv = imgElement.closest('div.flex.items-center');
    const artistsSpan = mainDiv?.querySelector('div.flex-col > span');
    expect(artistsSpan).toBeInTheDocument();
    expect(artistsSpan?.textContent).toBe('');
  });
});
