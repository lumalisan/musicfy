import * as Popover from '@radix-ui/react-popover';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook } from '@fortawesome/free-solid-svg-icons';

interface LibraryLoginPopoverProps {
  triggerClassName?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
}

export const LibraryLoginPopover = ({
  triggerClassName,
  side,
}: LibraryLoginPopoverProps) => {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type='button'
          aria-label='Open library login prompt'
          className={triggerClassName}
        >
          <FontAwesomeIcon icon={faBook} className='text-xl' />
          Library
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className='bg-secondary text-accent border-primary data-[state=open]:data-[side=top]:animate-slideDownAndFade data-[state=open]:data-[side=right]:animate-slideLeftAndFade data-[state=open]:data-[side=bottom]:animate-slideUpAndFade data-[state=open]:data-[side=left]:animate-slideRightAndFade z-50 w-64 rounded-md border p-5 shadow-lg'
          sideOffset={5}
          side={side}
          align='center'
        >
          <div className='flex flex-col gap-4'>
            <p className='text-center font-medium'>
              Want to see your playlists?
            </p>
            <p className='text-accent/80 mb-1 text-center text-sm'>
              Log in to access your personal library.
            </p>
          </div>
          <Popover.Arrow className='fill-secondary' />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};
