import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-50 p-4">
          <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-2xl">
            <h2 className="text-xl font-semibold text-red-400 mb-2">System Fault Detected</h2>
            <p className="text-zinc-400 mb-4 text-sm">
              The OmniKernel encountered an unexpected error.
            </p>
            <div className="bg-zinc-950 p-3 rounded-lg overflow-auto text-xs font-mono text-zinc-300 border border-zinc-800">
              {this.state.error?.message || 'Unknown error'}
            </div>
            <button
              className="mt-6 w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-lg transition-colors font-medium text-sm"
              onClick={() => window.location.reload()}
            >
              Reboot System
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
