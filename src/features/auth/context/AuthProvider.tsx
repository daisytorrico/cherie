import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  signOut,
  type User,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../../core/firebase';

interface AuthContextValue {
  user: User | null;
  esAdmin: boolean;
  clienteData: { nombre?: string; telefono?: string } | null;
  loadingAuth: boolean;
  modalAuthAbierto: boolean;
  modoInicialModal: 'login' | 'registro';
  abrirAuthModal: (modo?: 'login' | 'registro') => void;
  cerrarAuthModal: () => void;
  iniciarSesionConGoogle: () => Promise<void>;
  iniciarSesionConEmail: (email: string, pass: string) => Promise<User>;
  registrarConEmail: (
    nombre: string,
    email: string,
    pass: string
  ) => Promise<void>;
  enviarLinkRecuperacion: (email: string) => Promise<void>;
  cerrarSesion: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface Props {
  children: ReactNode;
}

export function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [esAdmin, setEsAdmin] = useState<boolean>(false);
  const [clienteData, setClienteData] = useState<{ nombre?: string; telefono?: string } | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const [modalAuthAbierto, setModalAuthAbierto] = useState(false);
  const [modoInicialModal, setModoInicialModal] = useState<
    'login' | 'registro'
  >('login');

  const abrirAuthModal = (modo: 'login' | 'registro' = 'login') => {
    setModoInicialModal(modo);
    setModalAuthAbierto(true);
  };

  const cerrarAuthModal = () => {
    setModalAuthAbierto(false);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoadingAuth(true);

      if (currentUser) {
        try {
          const adminRef = doc(db, 'admins', currentUser.uid);
          const adminSnap = await getDoc(adminRef);
          const esAdminRol = adminSnap.exists();

          // Sincronizar usuario a la colección clientes para que el Admin pueda buscarlo
          const clienteRef = doc(db, 'clientes', currentUser.uid);
          const clienteSnap = await getDoc(clienteRef);
          if (!clienteSnap.exists()) {
            await setDoc(clienteRef, {
              nombre: currentUser.displayName || '',
              email: currentUser.email || '',
              creadoEn: new Date().toISOString(),
            }, { merge: true });
            setClienteData({ nombre: currentUser.displayName || '' });
          } else {
            setClienteData(clienteSnap.data() as { nombre?: string; telefono?: string });
          }

          setEsAdmin(esAdminRol);
          setUser(currentUser);
        } catch (error) {
          console.error('Error verificando rol de admin / sync cliente:', error);
          setEsAdmin(false);
          setUser(currentUser);
          setClienteData(null);
        } finally {
          setLoadingAuth(false);
        }
      } else {
        setUser(null);
        setEsAdmin(false);
        setClienteData(null);
        setLoadingAuth(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const iniciarSesionConGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      setLoadingAuth(true);
      const cred = await signInWithPopup(auth, provider);
      const adminSnap = await getDoc(doc(db, 'admins', cred.user.uid));
      const esAdminUser = adminSnap.exists();
      if (esAdminUser || !window.location.pathname.startsWith('/admin')) {
        cerrarAuthModal();
      }
    } catch (err: any) {
      // Si el popup fue bloqueado por el navegador, hacemos fallback a redirect
      if (err?.code === 'auth/popup-blocked') {
        try {
          // Import dinámico para evitar side-effects en tiempo de carga si no se usa
          const { signInWithRedirect } = await import('firebase/auth');
          await signInWithRedirect(auth, provider);
        } catch (redirectErr) {
          console.error('Error en signInWithRedirect fallback:', redirectErr);
        }
      } else if (err?.code === 'auth/popup-closed-by-user') {
        // Usuario cerró el popup manualmente: no tratamos como error fatal
      } else {
        console.error('Error al iniciar sesión con Google:', err);
        throw err;
      }
    } finally {
      setLoadingAuth(false);
    }
  };

  const iniciarSesionConEmail = async (email: string, pass: string) => {
    setLoadingAuth(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      const adminSnap = await getDoc(doc(db, 'admins', cred.user.uid));
      const esAdminUser = adminSnap.exists();
      if (esAdminUser || !window.location.pathname.startsWith('/admin')) {
        cerrarAuthModal();
      }
      return cred.user;
    } finally {
      setLoadingAuth(false);
    }
  };

  const registrarConEmail = async (
    nombre: string,
    email: string,
    pass: string
  ) => {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      pass
    );
    if (userCredential.user) {
      await updateProfile(userCredential.user, { displayName: nombre });
    }
    cerrarAuthModal();
  };

  const enviarLinkRecuperacion = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const cerrarSesion = async () => {
    localStorage.removeItem('cherie_datos_cliente');
    await signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        esAdmin,
        clienteData,
        loadingAuth,
        modalAuthAbierto,
        modoInicialModal,
        abrirAuthModal,
        cerrarAuthModal,
        iniciarSesionConGoogle,
        iniciarSesionConEmail,
        registrarConEmail,
        enviarLinkRecuperacion,
        cerrarSesion,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
