import useLocalStorage from '../../../utils/localStorage';

interface DatosClienteStorage {
  nombre: string;
  telefono: string;
}

const STORAGE_KEY = 'cherie_datos_cliente';

export function useClienteStorage() {
  const [datos, setDatos] = useLocalStorage<DatosClienteStorage>(STORAGE_KEY, {
    nombre: '',
    telefono: '',
  });

  const guardarDatosCliente = (nombre: string, telefono: string) => {
    setDatos({ nombre, telefono });
  };

  return {
    clienteNombreGuardado: datos.nombre,
    clienteTelefonoGuardado: datos.telefono,
    guardarDatosCliente,
  };
}
