interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'gold' | 'silver';
}

export function Button({
  variant = 'gold',
  className = '',
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center whitespace-nowrap rounded-full px-6 py-2.5 text-xs font-semibold uppercase tracking-wide transition-all duration-200 disabled:opacity-50 disabled:active:scale-100 active:scale-95';
  const variants = {
    gold: 'bg-[linear-gradient(135deg,var(--secondary),var(--btn-gold-end))] text-surface-lowest shadow-sm hover:opacity-90 hover:shadow-md',
    silver:
      'bg-[linear-gradient(135deg,var(--primary),var(--btn-silver-end))] text-surface-lowest shadow-sm hover:opacity-90 hover:shadow-md',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
