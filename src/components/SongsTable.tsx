import type { Playlist } from '@/lib/types/Playlist';
import type { Song } from '@/lib/types/Song';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock } from '@fortawesome/free-solid-svg-icons';

import SongInfo from './SongInfo';

interface Props {
  playlist: Playlist;
  songs: Song[];
}

const SongsTable = ({ playlist, songs }: Props) => {
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
            playlist={playlist}
            songs={songs}
            song={song}
            idx={idx}
          />
        ))}
      </tbody>
    </table>
  );
};

export default SongsTable;
