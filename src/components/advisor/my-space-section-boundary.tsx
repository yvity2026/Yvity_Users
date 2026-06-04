"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = {
  sectionLabel: string;
  children: ReactNode;
};

type State = { error: Error | null };

export class MySpaceSectionBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[My Space] ${this.props.sectionLabel}`, error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-6 text-center">
          <p className="text-sm font-semibold text-foreground">
            Could not load {this.props.sectionLabel}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {this.state.error.message || "Something went wrong. Try again."}
          </p>
          <button
            type="button"
            onClick={() => this.setState({ error: null })}
            className="mt-4 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
