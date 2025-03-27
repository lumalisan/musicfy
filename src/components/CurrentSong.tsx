interface Props {
  image?: string;
  title?: string;
  artists?: string[];
}

const CurrentSong = ({ image, title, artists }: Props) => {
  return (
    <div className='relative flex items-center gap-5 overflow-hidden'>
      <picture className='bg-accent/80 h-16 w-16 overflow-hidden rounded-md shadow-lg'>
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
