import { useEffect } from 'react';

import type { Playlist } from '@/lib/types/Playlist';
import type { Song } from '@/lib/types/Song';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock } from '@fortawesome/free-solid-svg-icons';
import { usePlayerStore } from '@/store/playerStore';
import { generateRandomSongsQueue } from '@/lib/utils/generateRandomSongsQueue';

import SongInfo from './SongInfo';

interface Props {
  playlist: Playlist;
  songs: Song[];
}

const SongsTable = ({ playlist, songs }: Props) => {
  const { currentMusic, setCurrentMusic, isRandom } = usePlayerStore(
    (state) => state
  );

  // Set a random songs order if isRandom is true
  // Otherwise, set songsQueue to the original songs order
  useEffect(() => {
    if (isRandom && currentMusic.song) {
      const randomSongs = generateRandomSongsQueue(songs, currentMusic.song);
      setCurrentMusic({
        ...currentMusic,
        songsQueue: randomSongs,
        playlist,
      });
    } else {
      setCurrentMusic({
        ...currentMusic,
        songsQueue: songs,
        playlist,
      });
    }
  }, [songs, isRandom]);

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
