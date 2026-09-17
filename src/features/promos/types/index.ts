export interface Promo {
  id: string;
  imagenUrl: string; // The URL/ID from Cloudinary
  titulo?: string;
  subtitulo?: string;
  activa: boolean;
  orden?: number;
  creadoEn?: string; // ISO date string
  actualizadoEn?: string; // ISO date string
  esSistema?: boolean; // True if it's the default static hero
}
