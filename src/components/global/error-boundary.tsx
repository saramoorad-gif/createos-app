"use client";

import React from "react";
import { logError } from "@/lib/error-logger";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logError({
      source: "react-error-boundary",
      message: error.message,
      stack: error.stack,
      metadata: {
        componentStack: errorInfo.componentStack,
      },
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="max-w-md text-center">
            <div className="h-14 w-14 rounded-full bg-[#F4EAEA] flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-7 w-7 text-[#A03D3D]" />
            </div>
            <h2 className="text-[22px] font-serif text-[#1A2C38] mb-2">Something went wrong</h2>
            <p className="text-[14px] font-sans text-[#4A6070] mb-5 leading-relaxed">
              {this.state.error?.message || "An unexpected error occurred. The error has been logged and we'll look into it."}
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={this.handleReset}
                className="flex items-center gap-2 bg-[#1E3F52] text-white rounded-[8px] px-4 py-2.5 text-[13px] font-sans hover:bg-[#2a5269] transition-colors"
                style={{ fontWeight: 600 }}
              >
                <RefreshCw className="h-3.5 w-3.5" /> Try again
              </button>
              <a
                href="/dashboard"
                className="border-[1.5px] border-[#D8E8EE] text-[#4A6070] rounded-[8px] px-4 py-2.5 text-[13px] font-sans hover:bg-white transition-colors"
                style={{ fontWeight: 500 }}
              >
                Go home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
