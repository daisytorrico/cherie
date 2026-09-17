import useLocalStorage from '../../../utils/localStorage';

const KEY = 'cherie_favoritos_servicios';

export default function useFavoritosServicios() {
  const [favoritosIds, setFavoritosIds] = useLocalStorage<string[]>(KEY, []);

  const toggleFavorito = (servicio: { id: string }) => {
    setFavoritosIds((prev) => {
      const existe = prev.includes(servicio.id);
      if (existe) {
        return prev.filter((id) => id !== servicio.id);
      }
      return [...prev, servicio.id];
    });
  };

  const esFavorito = (id: string) => favoritosIds.includes(id);

  return { favoritosIds, toggleFavorito, esFavorito };
}
