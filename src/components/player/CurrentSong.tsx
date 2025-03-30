interface Props {
  image?: string;
  title?: string;
  artists?: string[];
}

const CurrentSong = ({ image, title, artists }: Props) => {
  return (
    <div className='relative flex items-center gap-2 md:gap-5 overflow-hidden'>
      <picture className='bg-accent/80 h-10 w-10 md:h-16 md:w-16 aspect-square overflow-hidden rounded-md shadow-lg'>
        <img src={image} alt={title} />
      </picture>

      <div className='flex flex-col text-accent'>
        <h3 className='block font-bold'>{title}</h3>
        <span className='text-xs opacity-80'>{artists?.join(', ')}</span>
      </div>
    </div>
  );
};

export default CurrentSong;
