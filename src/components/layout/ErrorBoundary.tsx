import { Component, type ErrorInfo, type ReactNode } from "react";

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error("TMACK48 runtime error:", error, info);
  }

  private reset = () => {
    this.setState({ hasError: false, error: undefined });
    if (typeof window !== "undefined") window.location.href = "/";
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="min-h-dvh grid place-items-center bg-ink-950 p-6">
        <div className="card-premium p-10 max-w-xl text-center">
          <p className="eyebrow">Something went sideways</p>
          <h1 className="mt-3 display-title text-4xl sm:text-5xl font-black">
            <span className="gold-text">Take Two</span>
          </h1>
          <p className="mt-4 text-platinum/75">
            A rare hiccup hit the universe. Hit the button below to get back on track.
          </p>
          <button type="button" onClick={this.reset} className="btn-gold mt-6">
            Back to Home
          </button>
          {this.state.error && import.meta.env.DEV && (
            <pre className="mt-6 text-left text-xs text-red-300/80 whitespace-pre-wrap break-all">
              {this.state.error.message}
            </pre>
          )}
        </div>
      </div>
    );
  }
}
