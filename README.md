# Chérie Beauty — Salón Boutique & Agenda de Turnos

[![React 19](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646cff?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4.0-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore%20%7C%20Auth-ffca28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![PWA Ready](https://img.shields.io/badge/PWA-Offline--First-5a0fc8?logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)

> Aplicación web progresiva (PWA) de alto rendimiento para catálogo de servicios y gestión inteligente de turnos de un salón de belleza y estética. Diseñada con un enfoque **mobile-first**, estética editorial refinada, arquitectura modular y disponibilidad transaccional en tiempo real.

---

## Características Principales

### Experiencia del Cliente (B2C)
- **Catálogo Interactivo**: Exploración visual de servicios organizados por categorías con tiempos estimados, precios y galerías de imágenes.
- **Carrito & Selección Múltiple (`ReservaFlotante`)**: Selección simultánea de múltiples tratamientos con cálculo automático de duración acumulada y monto total.
- **Motor Inteligente de Disponibilidad (`calcularSlots`)**: Algoritmo predictivo en cliente que calcula franjas horarias libres según agenda comercial, duración del servicio acumulado y turnos tomados, previniendo solapamientos.
- **Autenticación con Google OAuth**: Inicio de sesión ágil y sincronización de perfil con almacenamiento local seguro.
- **Gestión de Citas & Google Calendar**: Visualización de turnos activos e histórico, botón directo para sincronizar con Google Calendar.
- **Política de Cancelación Inteligente (48h)**: Cancelación automática directa si restan más de 48 horas para la cita; derivación personalizada a WhatsApp con mensaje precargado si el plazo es menor.
- **Lista de Favoritos (Wishlist)**: Guardado persistente de servicios preferidos.
- **Soporte PWA Offline-First**: Instalable en dispositivos móviles y escritorio con service worker optimizado mediante Workbox, navegación offline y avisos de conectividad.

### Panel de Administración (B2B)
- **Rutas Protegidas con Lazy Loading**: Aislamiento del bundle administrativo para optimizar la velocidad de carga inicial de clientes.
- **Agenda Operativa en Tiempo Real**: Vistas de calendario y grilla horaria con filtros por estado (`confirmado`, `pendiente`, `cancelado`, `bloqueado`).
- **Gestión de Servicios & Categorías**: ABM completo con reordenamiento interactivo vía drag-and-drop (`@dnd-kit`) y optimización de imágenes en Cloudinary.
- **Creación Manual de Turnos**: Generación de reservas telefónicas o presenciales con validación instantánea de solapamientos.
- **Configuración de Disponibilidad**: Ajuste dinámico de horarios de atención, pausas y días no laborables por día de la semana.

---

## Stack Tecnológico

| Capa | Tecnologías |
|---|---|
| **Core Frontend** | React 19, TypeScript, Vite 8 |
| **Estilos & Animaciones** | Tailwind CSS v4, Motion (Framer Motion) |
| **Base de datos** | Cloud Firestore (Reglas de seguridad granulares, transacciones) |
| **Autenticación** | Firebase Authentication (Google OAuth Provider) |
| **Almacenamiento Multimedia** | Cloudinary REST API |
| **PWA & Offline** | `vite-plugin-pwa`, Workbox, CacheFirst para media y Google Fonts |
| **Routing & UI Utils** | React Router DOM v7 (HashRouter para GH Pages), Lucide React, React Icons |
| **Testing** | Vitest, React Testing Library, JSDOM |

---

## Arquitectura del Proyecto

```text
cherie/
├── public/                # Assets estáticos, manifiesto PWA e íconos
├── scripts/               # Scripts auxiliares de optimización y build
├── src/
│   ├── assets/            # SVGs, logotipos y recursos visuales
│   ├── components/        # Componentes UI reutilizables (Header, Navbar, Modales)
│   ├── core/              # Configuración del salón y cliente Firebase inicializado
│   ├── features/
│   │   ├── admin/         # Agenda, paneles operativos, drawers y formularios
│   │   ├── auth/          # Contexto de autenticación, modales y rutas protegidas
│   │   ├── categorias/    # Lógica y vistas de categorías del catálogo
│   │   ├── contact/       # Vista de contacto y mapa interactivo
│   │   ├── home/          # Hero carousel y portada de bienvenida
│   │   ├── promos/        # Promociones vigentes
│   │   ├── pwa/           # Prompts de instalación y detección de conectividad
│   │   ├── servicios/     # Catálogo, tarjetas y visualizadores de servicios
│   │   ├── turnero/       # Motor de cálculo de turnos, reserva y gestión de citas
│   │   └── wishlist/      # Manejo de favoritos del usuario
│   ├── hooks/             # Hooks globales de UI, accesibilidad y scroll
│   ├── layout/            # Layout principal con soporte de mantenimiento
│   └── utils/             # Helpers de formato, moneda, fechas y Cloudinary
├── vite.config.ts         # Configuración de Vite con plugins de PWA y Tailwind
└── package.json
```

---

## Seguridad & Privacidad

1. **Partición de Datos en Firestore**:
   - Franjas públicas sin información confidencial para calcular disponibilidad.
   - Colección privada de citas con acceso restringido al cliente creador y administradores.
2. **Control de Concurrencia Transaccional**:
   - Prevención de doble reserva mediante transacciones atómicas de Firestore.
3. **Variables de Entorno**:
   - Aislamiento seguro de credenciales mediante variables `.env` protegidas en `.gitignore`.

---

## Puesta en Marcha Local

### 1. Clonar el repositorio
```bash
git clone https://github.com/daisytorrico/cherie.git
cd cherie
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crea un archivo `.env` en la raíz del proyecto con tus credenciales:
```env
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
VITE_FIREBASE_MEASUREMENT_ID=tu_measurement_id
VITE_CLOUDINARY_CLOUD_NAME=tu_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=tu_upload_preset
```

### 4. Ejecutar entorno de desarrollo
```bash
npm run dev
```

### 5. Compilar y testear
```bash
# Ejecutar suite de pruebas unitarias
npm test

# Compilación de producción
npm run build
```

---

## Licencia

Este proyecto fue desarrollado por [Daisy Torrico](https://github.com/daisytorrico). Todos los derechos reservados.