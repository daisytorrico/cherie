import useLocalStorage from '../../../utils/localStorage';

export interface ItemCarritoStorage {
  servicioId: string;
  cantidad: number;
}

const STORAGE_KEY = 'cherie_carrito_turnos';

export default function useCarritoStorage() {
  const [items, setItems] = useLocalStorage<ItemCarritoStorage[]>(
    STORAGE_KEY,
    []
  );

  const agregarItem = (servicioId: string) => {
    setItems((prev) => {
      const existente = prev.find((item) => item.servicioId === servicioId);
      if (existente) {
        return prev.map((item) =>
          item.servicioId === servicioId
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }
      return [...prev, { servicioId, cantidad: 1 }];
    });
  };

  const quitarItem = (servicioId: string) => {
    setItems((prev) =>
      prev
        .map((item) =>
          item.servicioId === servicioId
            ? { ...item, cantidad: item.cantidad - 1 }
            : item
        )
        .filter((item) => item.cantidad > 0)
    );
  };

  const limpiarCarrito = () => {
    setItems([]);
  };

  return {
    items,
    agregarItem,
    quitarItem,
    limpiarCarrito,
  };
}
