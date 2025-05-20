import { useAudioTime } from '@/hooks/useAudioTime';
import { formatDuration } from '@/lib/utils/formatDuration';
import { Slider } from '../shared/Slider';

const AudioController = ({
  audioRef,
}: {
  audioRef: React.RefObject<HTMLAudioElement | null>;
}) => {
  const { audioDuration, currentTime } = useAudioTime(audioRef);

  return (
    <div className='flex flex-col gap-x-3 text-xs md:flex-row'>
      <span className='hidden opacity-80 md:block'>
        {formatDuration(currentTime)}
      </span>
      <Slider
        defaultValue={[0]}
        max={audioDuration}
        min={0}
        className='md:w-[400px]'
        onValueChange={(value) => {
          if (audioRef.current) {
            const [newTime] = value;
            audioRef.current.currentTime = newTime;
          }
        }}
        value={[currentTime]}
      />
      <span className='hidden opacity-80 md:block'>
        {formatDuration(audioDuration)}
      </span>
      <div className='mt-1 flex w-full items-center justify-between md:hidden'>
        <span className='opacity-80'>{formatDuration(currentTime)}</span>
        <span className='opacity-80'>{formatDuration(audioDuration)}</span>
      </div>
    </div>
  );
};

export default AudioController;
