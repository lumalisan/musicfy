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
    <table className='divide-accent/50 min-w-full table-auto divide-y text-left'>
      <thead>
        <tr className='text-accent text-sm'>
          <th className='px-4 py-2'>#</th>
          <th className='px-4 py-2'>Title</th>
          <th className='px-4 py-2'>Album</th>
          <th className='px-4 py-2'>
            <FontAwesomeIcon icon={faClock} />
          </th>
        </tr>
      </thead>

      <tbody>
        <tr className='h-[16px]'></tr>
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
