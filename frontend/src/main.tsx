import { StrictMode, Component, type ReactNode, type ErrorInfo } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[UniHive ErrorBoundary] Caught render error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: '40px 20px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            maxWidth: '560px',
            margin: '60px auto',
            background: '#FFFFFF',
            border: '1px solid #FECACA',
            borderRadius: '20px',
            boxShadow: '0 10px 30px rgba(239, 68, 68, 0.1)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>⚠️</div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#991B1B' }}>
            UniHive Client Notice
          </h2>
          <p style={{ fontSize: '13px', color: '#B91C1C', marginTop: '6px' }}>
            {this.state.error?.message || 'A client render issue occurred.'}
          </p>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              background: '#0F2B5C',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '10px',
              fontWeight: 800,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Reset Cached State & Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
