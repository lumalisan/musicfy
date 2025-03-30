interface Props {
  image?: string;
  title?: string;
  artists?: string[];
}

const CurrentSong = ({ image, title, artists }: Props) => {
  return (
    <div className='relative flex items-center gap-2 overflow-hidden md:gap-5'>
      <picture className='bg-accent/80 aspect-square h-10 w-10 overflow-hidden rounded-md shadow-lg md:h-16 md:w-16'>
        <img src={image} alt={title} />
      </picture>

      <div className='text-accent flex flex-col'>
        <h3 className='block font-bold'>{title}</h3>
        <span className='text-xs opacity-80'>{artists?.join(', ')}</span>
      </div>
    </div>
  );
};

export default CurrentSong;
