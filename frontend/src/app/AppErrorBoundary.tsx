import { Component, type ErrorInfo, type ReactNode } from 'react';

type FallbackRenderProps = {
  error: Error;
  reset: () => void;
};

type AppErrorBoundaryProps = {
  children: ReactNode;
  fallbackRender: (props: FallbackRenderProps) => ReactNode;
  onReset?: () => void;
};

type AppErrorBoundaryState = {
  error: Error | null;
};

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  public state: AppErrorBoundaryState = {
    error: null,
  };

  public static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return {
      error,
    };
  }

  public componentDidCatch(_error: Error, _errorInfo: ErrorInfo): void {}

  private readonly reset = (): void => {
    this.props.onReset?.();
    this.setState({ error: null });
  };

  public render(): ReactNode {
    if (this.state.error) {
      return this.props.fallbackRender({
        error: this.state.error,
        reset: this.reset,
      });
    }

    return this.props.children;
  }
}
