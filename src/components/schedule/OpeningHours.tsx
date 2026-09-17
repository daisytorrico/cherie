// components/schedule/OpeningHours.tsx
import { Clock } from 'lucide-react';

interface OpeningHoursProps {
  /** 'compact' = Footer (chico, sans). 'feature' = secciones destacadas como el About Us (serif, más grande, con más onda) */
  variant?: 'compact' | 'feature';
  className?: string;
}

const schedule = [
  { day: 'Lunes a Viernes', hours: ['9:00 a 13:00 hs', '15:30 a 19:30 hs'] },
  { day: 'Sábados', hours: ['9:30 a 14:00 hs'] },
];

export function OpeningHours({
  variant = 'compact',
  className = '',
}: OpeningHoursProps) {
  if (variant === 'feature') {
    return (
      <div className={`flex flex-col gap-4 ${className}`}>
        <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.15em] text-secondary">
          <Clock className="h-4 w-4 shrink-0" />
          <span>Horarios</span>
        </div>
        <div className="flex flex-wrap gap-x-12 gap-y-5">
          {schedule.map(({ day, hours }) => (
            <div key={day}>
              <p className="font-serif text-3xl font-bold leading-tight text-secondary sm:text-4xl">
                {day}
              </p>
              {hours.map((h) => (
                <p key={h} className="mt-1 text-sm font-medium text-primary/70">
                  {h}
                </p>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.15em] text-primary">
        <Clock className="h-4 w-4 shrink-0 text-secondary" />
        <span>Horarios</span>
      </div>
      <div className="flex gap-8 text-sm">
        {schedule.map(({ day, hours }) => (
          <div key={day} className="flex flex-col gap-0.5">
            <span className="font-semibold text-primary">{day}</span>
            {hours.map((h) => (
              <span key={h} className="text-primary/70">
                {h}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
