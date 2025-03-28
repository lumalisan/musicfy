import { memo, useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPause, faPlay } from '@fortawesome/free-solid-svg-icons';
import { usePlayerStore } from '@/store/playerStore';
import { cn } from '@/lib/utils/cn';

interface Props {
  id: number;
  size?: 'large' | 'base';
}

const PlayButton = ({ id, size }: Props) => {
  const { isPlaying, currentMusic, setIsPlaying, setCurrentMusic } =
    usePlayerStore((state) => state);

  const [isPlayingPlaylist, setIsPlayingPlaylist] = useState(
    isPlaying && currentMusic.playlist?.id === id
  );

  useEffect(() => {
    setIsPlayingPlaylist(isPlaying && currentMusic.playlist?.id === id);
  }, [isPlaying, currentMusic]);

  const handleClick = () => {
    if (isPlayingPlaylist) {
      // Pause song
      setIsPlaying(false);
    } else if (currentMusic.playlist?.id === id) {
      // Continue with current song
      setIsPlaying(true);
    } else {
      // Get new song and play it
      fetch(`/api/playlistInfo?id=${id}`)
        .then((resp) => resp.json())
        .then(({ songs, playlist }: any) => {
          setCurrentMusic({ songsQueue: songs, playlist, song: songs[0] });
          setIsPlaying(true);
        });
    }
  };

  return (
    <button
      className={cn(
        size === 'large' ? 'h-14 w-14 text-2xl' : 'h-10 w-10 text-base',
        'bg-accent/80 flex items-center justify-center rounded-full text-black',
        'hover:bg-accent transition duration-300 hover:scale-105'
      )}
      onClick={handleClick}
    >
      <FontAwesomeIcon icon={isPlayingPlaylist ? faPause : faPlay} />
    </button>
  );
};

export default memo(PlayButton);
