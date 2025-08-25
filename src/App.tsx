import React from "react";

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error?: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: any) { return { hasError: true, error }; }
  componentDidCatch(error: any, info: any) { console.error("ErrorBoundary caught:", error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24, fontFamily: "system-ui" }}>
          <h2>Ops! Algo quebrou no React 😬</h2>
          <pre>{String(this.state.error)}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  console.log("App renderizou");
  return (
    <ErrorBoundary>
      <div style={{ padding: 24, fontFamily: "system-ui" }}>
        <h1>TransOptima • Front ok ✅</h1>
        <p>Se você está vendo isso, o boot do React está saudável.</p>
      </div>
    </ErrorBoundary>
  );
}
