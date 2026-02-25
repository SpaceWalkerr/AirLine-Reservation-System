import { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-screen flex items-center justify-center px-4"
          style={{ background: 'var(--color-bg)' }}
        >
          <div className="max-w-md w-full text-center">
            <div
              className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
              style={{ background: 'rgba(245, 158, 11, 0.1)', border: '2px solid rgba(245, 158, 11, 0.2)' }}
            >
              <AlertTriangle className="w-10 h-10 text-amber-500" />
            </div>

            <h1
              className="text-2xl font-bold font-display mb-3"
              style={{ color: 'var(--color-text)' }}
            >
              Something Went Wrong
            </h1>

            <p
              className="text-sm mb-2 leading-relaxed"
              style={{ color: 'var(--color-text-3)' }}
            >
              An unexpected error occurred. Please try refreshing the page or going back to the home page.
            </p>

            {this.state.error && (
              <div
                className="rounded-xl p-3 mb-6 text-left"
                style={{
                  background: 'rgba(239, 68, 68, 0.05)',
                  border: '1px solid rgba(239, 68, 68, 0.1)',
                }}
              >
                <p className="text-xs font-mono text-red-400 break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleGoHome}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
                style={{
                  background: 'var(--color-surface)',
                  color: 'var(--color-text-2)',
                }}
              >
                <Home className="w-4 h-4" />
                Go Home
              </button>
              <button
                onClick={this.handleReload}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-colors"
                style={{ background: 'var(--color-primary)' }}
              >
                <RefreshCw className="w-4 h-4" />
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
