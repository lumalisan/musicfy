import {
  forwardRef,
  type ElementRef,
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
  ElementRef<typeof Root>,
  ComponentPropsWithoutRef<typeof Root>
>(({ className, ...props }, ref) => (
  <SliderRoot
    ref={ref}
    className={cn(
      'group relative flex touch-none select-none items-center',
      className
    )}
    {...props}
  >
    <Track className='relative h-[0.3rem] w-full grow overflow-hidden rounded-full bg-primary'>
      <Range className='absolute h-full bg-accent/70 group-hover:bg-accent' />
    </Track>

    <Thumb className='border-primary bg-background ring-offset-background focus-visible:ring-ring hidden h-4 w-4 rounded-full border-2 bg-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-hover:block' />
  </SliderRoot>
));

Slider.displayName = SliderRoot.displayName;
