import { memo, useEffect, useState } from 'react';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPause, faPlay } from '@fortawesome/free-solid-svg-icons';
import { usePlayerStore } from '@/store/playerStore';

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
      // fetch('/api/featuredPlaylists')

      // Get new song and play it
      fetch(`/api/playlistInfo?id=${id}`)
        .then((resp) => resp.json())
        .then(({ songs, playlist }: any) => {
          setCurrentMusic({ songs, playlist, song: songs[0] });
          setIsPlaying(true);
        });
    }
  };

  return (
    <button
      className={classNames(
        size === 'large' ? 'h-14 w-14 text-2xl' : 'h-10 w-10 text-base',
        'flex items-center justify-center rounded-full bg-accent/80 text-black',
        'transition duration-300 hover:scale-105 hover:bg-accent'
      )}
      onClick={handleClick}
    >
      <FontAwesomeIcon icon={isPlayingPlaylist ? faPause : faPlay} />
    </button>
  );
};

export default memo(PlayButton);
