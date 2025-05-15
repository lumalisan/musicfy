import { useAudioTime } from '@/hooks/useAudioTime';
import { formatTime } from '@/lib/utils/formatTime';
import { Slider } from '../Slider';

const AudioController = ({
  audioRef,
}: {
  audioRef: React.RefObject<HTMLAudioElement | null>;
}) => {
  const { audioDuration, currentTime } = useAudioTime(audioRef);

  return (
    <div className='flex gap-x-3 text-xs flex-col md:flex-row'>
      <span className='hidden md:block opacity-80'>{formatTime(currentTime)}</span>
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
      <span className='hidden md:block opacity-80'>{formatTime(audioDuration)}</span>
      <div className='flex md:hidden items-center justify-between w-full mt-1'>
        <span className='opacity-80'>{formatTime(currentTime)}</span>
        <span className='opacity-80'>{formatTime(audioDuration)}</span>
      </div>
    </div>
  );
};

export default AudioController;
