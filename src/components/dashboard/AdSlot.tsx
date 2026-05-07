import clsx from 'clsx';

type AdSlotProps = {
  id: string;
  label?: string;
  className?: string;
  variant?: 'top' | 'sidebar' | 'side' | 'mobile';
};

export function AdSlot({
  id,
  label = 'Advertisement',
  className,
  variant = 'top',
}: AdSlotProps) {
  return (
    <div
      id={id}
      className={clsx(
        'relative flex items-center justify-center overflow-hidden border border-white/10',
        'bg-[linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))]',
        'text-center text-[10px] uppercase tracking-[0.22em] text-white/35',
        variant === 'top' && 'h-14 w-full',
        variant === 'sidebar' && 'h-32 w-full',
        variant === 'side' && 'h-full min-h-0 w-full',
        variant === 'mobile' &&
          'fixed inset-x-3 bottom-3 z-[9999] h-12 rounded-xl bg-black/80 backdrop-blur md:hidden',
        className,
      )}
    >
      <span className="px-3">{label}</span>
    </div>
  );
}