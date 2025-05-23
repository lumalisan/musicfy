export type Song = {
  id: string;
  title: string;
  image: string | null;
  artists: string[];
  album: string | null;
  duration: number;
  url?: string;
};
