import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** Static node, or a render function given the caught error. */
  fallback?: ReactNode | ((error: Error) => ReactNode);
  onError?: (error: Error, info: ErrorInfo) => void;
};

type State = { error: Error | null };

/**
 * Catches render-time errors in its subtree. Without this, a single thrown
 * error (e.g. a 3D model that fails to load) unmounts the whole React tree
 * and the app goes blank white. Works in both the DOM tree and the
 * react-three-fiber tree.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Surface to the console so a brain-hosted crash is diagnosable.
    console.error("[cell-architecture-studio] caught render error:", error, info);
    this.props.onError?.(error, info);
  }

  render() {
    const { error } = this.state;
    if (error) {
      const { fallback } = this.props;
      if (typeof fallback === "function") return fallback(error);
      return fallback ?? null;
    }
    return this.props.children;
  }
}
