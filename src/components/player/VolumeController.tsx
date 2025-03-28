import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faVolumeHigh,
  faVolumeLow,
  faVolumeXmark,
} from '@fortawesome/free-solid-svg-icons';
import { usePlayerStore } from '@/store/playerStore';
import { Slider } from '../Slider';

const VolumeController = () => {
  const volume = usePlayerStore((state) => state.volume);
  const setVolume = usePlayerStore((state) => state.setVolume);
  const [previousVolume, setPreviousVolume] = useState(1);

  const isVolumeSilenced = volume === 0;
  const isVolumeLow = volume < 0.5;

  const handleVolumeIconClick = () => {
    if (isVolumeSilenced) {
      setVolume(previousVolume);
    } else {
      setPreviousVolume(volume);
      setVolume(0);
    }
  };

  return (
    <div className='text-accent flex justify-center gap-x-2'>
      <button
        className='w-5 text-left opacity-70 transition duration-300 hover:opacity-100'
        onClick={handleVolumeIconClick}
      >
        <FontAwesomeIcon
          icon={
            isVolumeSilenced
              ? faVolumeXmark
              : isVolumeLow
                ? faVolumeLow
                : faVolumeHigh
          }
        />
      </button>

      <Slider
        defaultValue={[1]}
        max={1}
        min={0}
        step={0.001}
        className='w-[95px]'
        onValueChange={(value) => {
          const [newVol] = value;
          setVolume(newVol);
        }}
        value={[volume]}
      />
    </div>
  );
};

export default VolumeController;
