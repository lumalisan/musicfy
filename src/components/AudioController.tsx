import { useAudioTime } from '@/hooks/useAudioTime';
import { formatTime } from '@/utils/formatTime';
import { Slider } from './Slider';

const AudioController = ({
  audioRef,
}: {
  audioRef: React.RefObject<HTMLAudioElement>;
}) => {
  const { audioDuration, currentTime } = useAudioTime(audioRef);

  return (
    <div className='flex gap-x-3 text-xs'>
      <span className='opacity-80'>{formatTime(currentTime)}</span>
      <Slider
        defaultValue={[0]}
        max={audioDuration}
        min={0}
        className='w-[400px]'
        onValueChange={(value) => {
          if (audioRef.current) {
            const [newTime] = value;
            audioRef.current.currentTime = newTime;
          }
        }}
        value={[currentTime]}
      />
      <span className='opacity-80'>{formatTime(audioDuration)}</span>
    </div>
  );
};

export default AudioController;
