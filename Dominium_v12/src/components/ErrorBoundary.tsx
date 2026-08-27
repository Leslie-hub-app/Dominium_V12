import React from 'react';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = {
    hasError: false,
    error: null
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error caught by Dominium ErrorBoundary:', error, errorInfo);
    this.setState({ error });
  }

  handleReset = () => {
    try {
      localStorage.removeItem('dominium_save_slots_v1');
    } catch {}
    window.location.reload();
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#09090b] text-zinc-200 flex items-center justify-center p-4 sm:p-6 font-sans select-none">
          <div className="bg-[#121216] border border-rose-800/80 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 text-center">
            <div className="w-16 h-16 rounded-2xl bg-rose-950/60 border border-rose-700/50 flex items-center justify-center mx-auto text-rose-400">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-black text-zinc-100 font-serif">
                Simulation Encountered an Exception
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Dominium caught an unexpected runtime condition. You can reload the simulation or reset state if needed.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800 text-left font-mono text-[11px] text-rose-300 max-h-36 overflow-y-auto">
                <span className="font-bold text-rose-400 block mb-1">Error Trace:</span>
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-zinc-950 font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Simulation</span>
              </button>

              <button
                type="button"
                onClick={this.handleReset}
                className="py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-rose-400 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Reset Save Data</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
