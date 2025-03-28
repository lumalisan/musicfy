import {
  forwardRef,
  type ComponentRef,
  type ComponentPropsWithoutRef,
} from 'react';
import {
  Root as SliderRoot,
  Track,
  type Root,
  Range,
  Thumb,
} from '@radix-ui/react-slider';
import cn from 'clsx';

export const Slider = forwardRef<
  ComponentRef<typeof Root>,
  ComponentPropsWithoutRef<typeof Root>
>(({ className, ...props }, ref) => (
  <SliderRoot
    ref={ref}
    className={cn(
      'group relative flex touch-none items-center select-none',
      className
    )}
    {...props}
  >
    <Track className='bg-primary relative h-[0.3rem] w-full grow overflow-hidden rounded-full'>
      <Range className='bg-accent/70 group-hover:bg-accent absolute h-full' />
    </Track>

    <Thumb className='bg-background ring-offset-background focus-visible:ring-ring border-primary hidden h-4 w-4 rounded-full border-2 bg-white transition-colors group-hover:block focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50' />
  </SliderRoot>
));

Slider.displayName = SliderRoot.displayName;
