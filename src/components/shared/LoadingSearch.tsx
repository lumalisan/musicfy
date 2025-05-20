import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

export const LoadingSearch = () => {
  return (
    <div className='flex flex-col items-center justify-center py-3 text-center'>
      <FontAwesomeIcon icon={faSpinner} className='text-accent animate-spin' />
      <p className='mt-1 text-sm'>Searching...</p>
    </div>
  );
};
