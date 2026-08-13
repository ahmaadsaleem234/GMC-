import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    (this as any).state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Uncaught Error caught by ErrorBoundary:", error, errorInfo);
  }

  public render(): ReactNode {
    const currentState = (this as any).state as State;
    if (currentState.hasError) {
      return (
        <div className="min-h-screen bg-[#05070E] text-white flex items-center justify-center p-6 font-mono">
          <div className="max-w-md w-full bg-[#0A0E1A] border border-rose-500/30 rounded-2xl p-6 text-center space-y-4 shadow-2xl">
            <div className="inline-flex p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">GMC TRADING TERMINAL</h1>
            <p className="text-xs text-slate-400">
              A temporary runtime error occurred while loading the application view.
            </p>
            {currentState.error && (
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-left text-[11px] text-rose-300 overflow-x-auto max-h-32">
                {currentState.error.message || String(currentState.error)}
              </div>
            )}
            <button
              onClick={() => {
                (this as any).setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
              <span>RELOAD APPLICATION</span>
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
