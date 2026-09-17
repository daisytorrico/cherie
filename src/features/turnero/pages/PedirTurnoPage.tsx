import { TurnoSummary } from '../components/cliente/TurnoSummary';
import { useTurnoFeature } from '../hooks/useTurnoFeature';
import { useAuth } from '../../auth/context/AuthProvider';

export function PedirTurnoPage() {
  const {
    seleccionados,
    agregarServicio,
    quitarServicio,
    clienteNombre,
    setClienteNombre,
    clienteTelefono,
    setClienteTelefono,
    fecha,
    setFecha,
    horaSeleccionada,
    setHoraSeleccionada,
    duracionTotal,
    slots,
    loadingSlots,
    enviado,
    enviando,
    error,
    enviarSolicitud,
    clienteAuthUid,
  } = useTurnoFeature();

  const { abrirAuthModal } = useAuth();

  return (
    <div className="page-container px-4 py-6 text-primary">
      <div className="mb-8 text-center">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-secondary mb-2">
          Nueva Reserva
        </h1>
        <p className="mx-auto max-w-2xl text-sm text-primary/70">
          Elegí tu fecha, horario disponible, ¡y listo!
        </p>
      </div>

      <TurnoSummary
        seleccionados={seleccionados}
        clienteNombre={clienteNombre}
        setClienteNombre={setClienteNombre}
        clienteTelefono={clienteTelefono}
        setClienteTelefono={setClienteTelefono}
        fecha={fecha}
        setFecha={setFecha}
        horaSeleccionada={horaSeleccionada}
        setHoraSeleccionada={setHoraSeleccionada}
        duracionTotal={duracionTotal}
        slots={slots}
        loadingSlots={loadingSlots}
        enviado={enviado}
        enviando={enviando}
        error={error}
        onQuitar={quitarServicio}
        onAgregar={agregarServicio}
        onEnviar={enviarSolicitud}
        clienteAuthUid={clienteAuthUid}
        iniciarSesionConGoogle={() => {
          abrirAuthModal('login');
          return Promise.resolve();
        }}
      />
    </div>
  );
}
