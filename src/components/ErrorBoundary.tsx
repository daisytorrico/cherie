import React from 'react';

interface State {
  hasError: boolean;
  error?: Error | null;
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  State
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    console.error('ErrorBoundary capturó un error:', error, info);

    const isChunkError =
      error?.message &&
      /Failed to fetch dynamically imported module|Importing a module script failed/i.test(
        error.message
      );

    if (isChunkError) {
      const retryKey = 'cherie_chunk_retry';
      if (!sessionStorage.getItem(retryKey)) {
        sessionStorage.setItem(retryKey, 'true');
        window.location.reload();
      }
    }
  }

  render() {
    if (this.state.hasError) {
      const isChunkError =
        this.state.error?.message &&
        /Failed to fetch dynamically imported module|Importing a module script failed/i.test(
          this.state.error.message
        );

      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-lg rounded-xl border bg-surface-lowest p-6 text-center">
            <h2 className="text-xl font-semibold text-primary mb-2">
              {isChunkError ? 'Nueva versión disponible' : 'Algo salió mal'}
            </h2>
            <p className="text-sm text-primary/80">
              {isChunkError
                ? 'Se ha actualizado la aplicación. Por favor recargá la página para cargar la versión más reciente.'
                : 'Estamos trabajando para solucionarlo. Por favor recargá la página.'}
            </p>
            <div className="mt-4">
              <button
                onClick={() => {
                  sessionStorage.removeItem('cherie_chunk_retry');
                  sessionStorage.removeItem('cherie_preload_retry');
                  location.reload();
                }}
                className="rounded-full bg-secondary px-4 py-2 text-surface-lowest"
              >
                Recargar página
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
