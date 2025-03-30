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
      <td className='hidden w-5 rounded-tl-lg rounded-bl-lg px-4 py-2 md:table-cell'>
        {idx + 1}
      </td>
      <td className='flex w-full gap-3 px-4 py-2'>
        <picture className='aspect-square h-11 w-11 flex-shrink-0'>
          <img src={song.image} alt={song.title} className='h-full w-full' />
        </picture>
        <div className='flex flex-col overflow-hidden'>
          <h3 className='text-accent overflow-hidden text-base font-normal text-ellipsis whitespace-nowrap'>
            {song.title}
          </h3>
          <span className='overflow-hidden text-ellipsis whitespace-nowrap'>
            {song.artists.join(', ')}
          </span>
        </div>
      </td>
      <td className='overflow-hidden px-4 py-2 text-ellipsis whitespace-nowrap'>
        {song.album}
      </td>
      <td className='hidden rounded-tr-lg rounded-br-lg px-4 py-2 md:table-cell'>
        {song.duration}
      </td>
    </tr>
  );
};

export default SongInfo;
