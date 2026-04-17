import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert } from 'lucide-react';

interface Props {
  children: ReactNode;
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
        <div className="w-full h-screen bg-black flex items-center justify-center p-6 text-white font-mono">
          <div className="max-w-md border border-gane-red bg-gane-red/10 p-6 rounded-3xl">
            <div className="flex items-center gap-3 text-gane-red mb-4">
              <ShieldAlert size={32} />
              <h1 className="text-xl font-bold tracking-widest uppercase">System Fault Detected</h1>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              The G.A.N.E. core has intercepted a critical exception. Self-healing protocols initiated.
            </p>
            <div className="bg-black p-3 border border-gane-red/30 text-xs text-gane-red overflow-auto max-h-40 rounded-xl">
              {this.state.error?.message || 'Unknown Error'}
            </div>
            <button
              className="mt-6 w-full py-3 bg-gane-red/20 border border-gane-red text-gane-red hover:bg-gane-red/30 transition-colors font-bold tracking-widest uppercase rounded-full"
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
