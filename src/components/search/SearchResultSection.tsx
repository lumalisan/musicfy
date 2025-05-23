import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import type {
  AlbumResult,
  PlaylistResult,
  SongResult,
} from '@/lib/types/SearchResultItem';
import { cn } from '@/lib/utils/cn';

type SearchResultSectionProps = {
  title: string;
  icon: any;
  items: SongResult[] | AlbumResult[] | PlaylistResult[];
  isSong?: boolean;
  renderItem: (
    item: SongResult | AlbumResult | PlaylistResult
  ) => React.ReactNode;
};

export const SearchResultSection = ({
  title,
  icon,
  items,
  isSong,
  renderItem,
}: SearchResultSectionProps) => {
  if (items.length === 0) return null;

  return (
    <section>
      <div className='mb-4 flex items-center gap-2'>
        <FontAwesomeIcon icon={icon} className='text-accent' />
        <h2 className='text-xl font-bold'>{title}</h2>
        <span className='bg-accent/20 text-accent ml-2 rounded-full px-2 py-0.5 text-xs'>
          {items.length}
        </span>
      </div>

      <div
        className={cn(
          'grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6',
          isSong && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
        )}
      >
        {items.map((item) => (
          <article
            key={item.id}
            className='group hover:bg-secondary bg-secondary/30 relative w-full cursor-pointer rounded-md p-2 shadow-lg transition-all duration-300 hover:shadow-xl'
          >
            {renderItem(item)}
          </article>
        ))}
      </div>
    </section>
  );
};
