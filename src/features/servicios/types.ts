export interface Categoria {
  id: string;
  nombre: string;
  descripcion: string;
  imagenUrl: string;
  orden: number;
  activa: boolean;
}
export interface Servicio {
  id: string;
  nombre: string;
  categoria: string; // ID de la categoría
  descripcion: string;
  precio?: number;
  imagenUrl?: string;
  galeria?: string[];
  duracion?: number;
  activo: boolean;
  orden: number;
  creadoEn?: string;
}
