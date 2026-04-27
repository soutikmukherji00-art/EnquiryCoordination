
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";

function renderFatalOverlay(message: string): void {
  const id = "fatal-runtime-overlay";
  if (document.getElementById(id)) return;
  const node = document.createElement("div");
  node.id = id;
  node.style.position = "fixed";
  node.style.inset = "0";
  node.style.zIndex = "99999";
  node.style.padding = "24px";
  node.style.background = "#fff";
  node.style.color = "#111";
  node.style.fontFamily = "system-ui, sans-serif";
  node.innerHTML = `<h2 style="margin:0 0 12px;">Application failed to start</h2><pre style="white-space:pre-wrap;background:#f5f5f5;padding:12px;border-radius:8px;">${message}</pre>`;
  document.body.appendChild(node);
}

window.addEventListener("error", (event) => {
  const msg = event.error instanceof Error ? event.error.stack || event.error.message : event.message;
  renderFatalOverlay(String(msg || "Unknown window error"));
});

window.addEventListener("unhandledrejection", (event) => {
  const reason = event.reason instanceof Error ? event.reason.stack || event.reason.message : String(event.reason);
  renderFatalOverlay(`Unhandled promise rejection:\n${reason}`);
});

type RootBoundaryState = {
  hasError: boolean;
  message: string;
};

class RootErrorBoundary extends React.Component<
  { children: React.ReactNode },
  RootBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: unknown): RootBoundaryState {
    const message = error instanceof Error ? error.message : "Unknown runtime error";
    return { hasError: true, message };
  }

  override componentDidCatch(error: unknown): void {
    // Keep this visible in browser console for fast debugging.
    console.error("[RootErrorBoundary] Runtime error:", error);
  }

  override render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "24px", fontFamily: "system-ui, sans-serif" }}>
          <h2 style={{ margin: "0 0 12px" }}>Application crashed</h2>
          <p style={{ margin: "0 0 8px" }}>
            A runtime error occurred while rendering the app.
          </p>
          <pre
            style={{
              whiteSpace: "pre-wrap",
              background: "#f5f5f5",
              padding: "12px",
              borderRadius: "8px",
            }}
          >
            {this.state.message}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById("root")!).render(
  <RootErrorBoundary>
    <App />
  </RootErrorBoundary>,
);
  