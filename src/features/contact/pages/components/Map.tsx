import styles from '../../../../components/map/style.module.css';
import { SITE_CONFIG } from '../../../../core/config';

export default function Map() {
  const lat = SITE_CONFIG.mapLat;
  const lng = SITE_CONFIG.mapLng;
  const zoom = SITE_CONFIG.mapZoom;

  const src = `https://www.google.com/maps?q=${lat},${lng}&z=${zoom}&output=embed`;

  return (
    <iframe
      title={`Ubicación de ${SITE_CONFIG.name}`}
      src={src}
      className={styles.mapContainer}
      style={{ border: 0 }}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      allowFullScreen
    />
  );
}
