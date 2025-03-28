import type { Playlist } from '@/lib/types/Playlist';
import type { Song } from '@/lib/types/Song';
import { generateRandomSongsQueue } from '@/lib/utils/generateRandomSongsQueue';
import { usePlayerStore } from '@/store/playerStore';

interface Props {
  playlist: Playlist;
  songs: Song[];
  song: Song;
  idx: number;
}

const SongInfo = ({ playlist, songs, song, idx }: Props) => {
  const { currentMusic, setCurrentMusic, isRandom } = usePlayerStore(
    (state) => state
  );

  const handleClick = () => {
    if (currentMusic.song?.id !== song.id) {
      // If isRandom is true and user selects a song,
      // play that song and set songsQueue to a random songs order
      if (isRandom) {
        const randomSongs = generateRandomSongsQueue(songs, song);
        setCurrentMusic({ songsQueue: randomSongs, playlist, song });
      } else {
        setCurrentMusic({ songsQueue: songs, playlist, song });
      }
    }
  };

  return (
    <tr
      className='text-accent hover:bg-accent/10 border-spacing-0 cursor-pointer overflow-hidden text-sm font-light transition duration-300'
      onClick={handleClick}
    >
      <td className='w-5 rounded-tl-lg rounded-bl-lg px-4 py-2'>{idx + 1}</td>
      <td className='flex gap-3 px-4 py-2'>
        <picture className=''>
          <img src={song.image} alt={song.title} className='h-11 w-11' />
        </picture>
        <div className='flex flex-col'>
          <h3 className='text-accent text-base font-normal'>{song.title}</h3>
          <span>{song.artists.join(', ')}</span>
        </div>
      </td>
      <td className='px-4 py-2'>{song.album}</td>
      <td className='rounded-tr-lg rounded-br-lg px-4 py-2'>{song.duration}</td>
    </tr>
  );
};

export default SongInfo;
