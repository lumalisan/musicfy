import React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { cn } from '@/lib/utils/cn';

interface DialogProps extends DialogPrimitive.DialogProps {}

const Dialog = ({ children, ...props }: DialogProps) => {
  return <DialogPrimitive.Root {...props}>{children}</DialogPrimitive.Root>;
};
Dialog.displayName = 'Dialog';

const DialogTrigger = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Trigger ref={ref} className={className} {...props} asChild>
    {children}
  </DialogPrimitive.Trigger>
));
DialogTrigger.displayName = DialogPrimitive.Trigger.displayName;

const DialogPortal = DialogPrimitive.Portal;
DialogPortal.displayName = DialogPrimitive.Portal.displayName;

const DialogOverlay = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'bg-primary/80 data-[state=open]:animate-overlayShow fixed inset-0 z-50',
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'bg-secondary fixed top-1/2 left-1/2 z-50 max-h-[90vh] w-[90vw] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg p-6 shadow-xl focus:outline-none', // Estilos por defecto del original
        'data-[state=open]:animate-contentShow',
        className
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogTitle = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      'mb-6 text-center text-2xl leading-none font-semibold tracking-tight',
      className
    )}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description ref={ref} className={className} {...props} />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

interface DialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

const DialogFooter = ({ className, children, ...props }: DialogFooterProps) => (
  <div
    className={cn(
      'mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:space-x-2',
      className
    )}
    {...props}
  >
    {children}
  </div>
);
DialogFooter.displayName = 'DialogFooter';

const DialogClose = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Close>
>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Close ref={ref} className={className} {...props} asChild>
    {children}
  </DialogPrimitive.Close>
));
DialogClose.displayName = DialogPrimitive.Close.displayName;

const DialogHeaderCloseButton = React.forwardRef<
  HTMLButtonElement,
  Omit<DialogPrimitive.DialogCloseProps, 'asChild'> & { iconClassName?: string }
>(({ className, iconClassName, ...props }, ref) => (
  <DialogPrimitive.Close ref={ref} {...props} asChild>
    <button
      type='button'
      className={cn(
        'focus-visible:ring-accent absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2',
        className
      )}
      aria-label={props['aria-label'] || 'Close'}
    >
      <FontAwesomeIcon icon={faTimes} className={iconClassName} />
    </button>
  </DialogPrimitive.Close>
));
DialogHeaderCloseButton.displayName = 'DialogHeaderCloseButton';

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogHeaderCloseButton,
};
