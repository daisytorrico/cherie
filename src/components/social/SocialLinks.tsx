// components/social/SocialLinks.tsx
import { FaInstagram, FaFacebook } from 'react-icons/fa';
import { SITE_CONFIG } from '../../core/config';

interface SocialLinksProps {
  /** Clases del contenedor flex que envuelve los íconos */
  containerClassName?: string;
  /** Clases de cada <a> (color, hover, padding) */
  linkClassName?: string;
  /** Clases del ícono (tamaño) */
  iconClassName?: string;
  /** Si es true, muestra el @ / nombre de usuario junto al ícono */
  showHandle?: boolean;
  /** Clases del texto del handle (solo aplica si showHandle=true) */
  handleClassName?: string;
}

const links = [
  {
    name: 'Instagram',
    href: SITE_CONFIG.instagramUrl,
    handle: `@${SITE_CONFIG.instagramHandle.replace('@', '')}`,
    Icon: FaInstagram,
  },
  {
    name: 'Facebook',
    href: SITE_CONFIG.facebookUrl,
    handle: SITE_CONFIG.name,
    Icon: FaFacebook,
  },
];

export function SocialLinks({
  containerClassName = 'flex items-center gap-4',
  linkClassName = 'text-primary hover:text-secondary transition-colors p-1',
  iconClassName = 'text-xl',
  showHandle = false,
  handleClassName = 'font-serif italic text-lg',
}: SocialLinksProps) {
  return (
    <div className={containerClassName}>
      {links.map(({ name, href, handle, Icon }) => (
        <a
          key={name}
          href={href}
          target="_blank"
          rel="noreferrer"
          className={
            showHandle
              ? `${linkClassName} inline-flex items-center gap-2`
              : linkClassName
          }
          aria-label={name}
        >
          <Icon className={iconClassName} />
          {showHandle && <span className={handleClassName}>{handle}</span>}
        </a>
      ))}
    </div>
  );
}
