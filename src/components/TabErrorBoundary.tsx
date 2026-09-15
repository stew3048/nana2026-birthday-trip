import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  tabName?: string;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class TabErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in tab:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 my-6 bg-white rounded-3xl border border-red-200 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-lg font-bold text-slate-800">
            {this.props.tabName ? `載入「${this.props.tabName}」時遇到小狀況` : '載入內容時遇到小狀況'}
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            {this.props.fallbackMessage || '資料正在重新整理中，請點擊下方按鈕重新載入此分頁。'}
          </p>
          <button
            onClick={this.handleReset}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[var(--romantic-rose,#0284C7)] text-white hover:bg-[var(--romantic-rose-hover,#0369A1)] text-sm font-semibold transition-all cursor-pointer shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            <span>重新載入</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
