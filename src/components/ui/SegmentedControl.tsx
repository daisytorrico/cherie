import React from 'react';
import { motion } from 'motion/react';

export interface SegmentOption<T extends string> {
  value: T;
  label: React.ReactNode;
  badge?: number | string;
}

export interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  layoutId: string;
  size?: 'sm' | 'md';
  activeColorClass?: string;
  className?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  layoutId,
  size = 'md',
  activeColorClass = 'bg-secondary',
  className = '',
}: SegmentedControlProps<T>) {
  const sizeClasses =
    size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 sm:px-4 py-1.5 text-xs';

  return (
    <div
      className={`inline-flex rounded-xl bg-surface-low p-1 border border-camel/30 shrink-0 relative ${className}`}
    >
      {options.map((opt) => {
        const isActive = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`relative z-10 rounded-lg font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${sizeClasses} ${
              isActive
                ? 'text-white font-bold'
                : 'text-primary/70 hover:text-primary'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId={layoutId}
                className={`absolute inset-0 rounded-lg -z-10 shadow-xs ${activeColorClass}`}
                transition={{ type: 'spring', stiffness: 450, damping: 32 }}
              />
            )}
            <span>{opt.label}</span>
            {opt.badge !== undefined && (
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                  isActive
                    ? 'bg-white/25 text-white'
                    : 'bg-camel/20 text-primary/75'
                }`}
              >
                {opt.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
