import clsx from 'clsx';

type AdSlotProps = {
  id: string;
  label?: string;
  className?: string;
  variant?: 'top' | 'sidebar' | 'side' | 'mobile' | 'inline';
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
      data-ad-slot={variant}
      className={clsx(
        'relative flex items-center justify-center overflow-hidden border border-white/10',
        'bg-[linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,255,255,0.015))]',
        'text-center text-[10px] uppercase tracking-[0.22em] text-white/35',
        'before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06),transparent_58%)]',
        variant === 'top' && 'h-16 w-full md:h-14',
        variant === 'sidebar' && 'h-40 w-full md:h-36 lg:h-32',
        variant === 'side' && 'h-44 w-full lg:h-full lg:min-h-0',
        variant === 'inline' && 'h-28 w-full',
        variant === 'mobile' &&
          'fixed inset-x-3 bottom-3 z-[9999] h-12 rounded-xl bg-black/85 shadow-2xl backdrop-blur md:hidden',
        className,
      )}
    >
      <span className="relative z-10 px-3">{label}</span>
    </div>
  );
}