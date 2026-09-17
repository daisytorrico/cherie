import { useTurnoContext } from '../../turnero/context/TurnoProvider';

export function useTurnoFeature() {
  return useTurnoContext();
}
