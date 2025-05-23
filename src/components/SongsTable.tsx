import { faClock } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import type { ItemInfo } from '@/lib/types/ItemInfo';
import type { Song } from '@/lib/types/Song';

import SongInfo from './SongInfo';

type Props = {
  itemInfo: ItemInfo;
  songs: Song[];
};

const SongsTable = ({ itemInfo, songs }: Props) => {
  return (
    <table className='divide-accent/50 w-full min-w-full table-fixed divide-y text-left md:table-auto'>
      <thead>
        <tr className='text-accent text-sm'>
          <th className='hidden px-4 py-2 md:table-cell'>#</th>
          <th className='w-[70%] px-4 py-2'>Title</th>
          <th className='px-4 py-2'>Album</th>
          <th className='hidden px-4 py-2 md:table-cell'>
            <FontAwesomeIcon icon={faClock} />
          </th>
        </tr>
      </thead>

      <tbody>
        <tr className='h-4'></tr>
        {songs.map((song, idx) => (
          <SongInfo
            key={song.id}
            itemInfo={itemInfo}
            songsInView={songs}
            song={song}
            index={idx}
          />
        ))}
      </tbody>
    </table>
  );
};

export default SongsTable;
