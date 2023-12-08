import type { Playlist, Song } from '@/lib/data'
import { usePlayerStore } from '@/store/playerStore';

interface Props {
    playlist: Playlist;
    songs: Song[];
    song: Song;
    idx: number;
}

const SongInfo = ({ playlist, songs, song, idx }: Props) => {
    const { currentMusic, setCurrentMusic } = usePlayerStore(state => state);

    const handleClick = () => {
        if(currentMusic.song?.id !== song.id) {
            setCurrentMusic({ songs, playlist, song })
        } 
    }

    return (
        <tr
            className="cursor-pointer border-spacing-0 text-accent text-sm font-light hover:bg-accent/10 overflow-hidden transition duration-300"
            onClick={handleClick}
        >
            <td className="px-4 py-2 rounded-tl-lg rounded-bl-lg w-5">
                {idx + 1}
            </td>
            <td className="px-4 py-2 flex gap-3">
                <picture className="">
                    <img
                        src={song.image}
                        alt={song.title}
                        className="w-11 h-11"
                    />
                </picture>
                <div className="flex flex-col">
                    <h3 className="text-accent text-base font-normal">
                        {song.title}
                    </h3>
                    <span>{song.artists.join(", ")}</span>
                </div>
            </td>
            <td className="px-4 py-2">{song.album}</td>
            <td className="px-4 py-2 rounded-tr-lg rounded-br-lg">
                {song.duration}
            </td>
        </tr>
    )
}

export default SongInfo