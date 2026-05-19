import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { ErrorBoundary } from "./ErrorBoundary";
import "./styles.css";

/**
 * Last-resort fallback: if App itself crashes on render, show the error
 * instead of a blank white screen — essential when the app runs embedded in
 * a brain where there is no easy console access.
 */
function StartupError({ error }: { error: Error }) {
  return (
    <div
      style={{
        maxWidth: 720,
        margin: "48px auto",
        padding: "28px 32px",
        fontFamily:
          "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
        color: "#3f3528",
        background: "#fbf7ee",
        border: "1px solid rgba(84,74,58,0.18)",
        borderRadius: 12,
        lineHeight: 1.5,
      }}
    >
      <h1 style={{ fontSize: "1.3rem", margin: "0 0 8px" }}>
        Cell Architecture Studio could not start
      </h1>
      <p style={{ margin: "0 0 14px", color: "rgba(63,53,40,0.75)" }}>
        The app hit an error while rendering. The message below is the cause.
      </p>
      <code
        style={{
          display: "block",
          padding: "10px 12px",
          background: "rgba(189,81,77,0.1)",
          border: "1px solid rgba(189,81,77,0.3)",
          borderRadius: 8,
          color: "#a23c39",
          wordBreak: "break-word",
        }}
      >
        {error.message || "Unknown error"}
      </code>
      {error.stack && (
        <pre
          style={{
            marginTop: 12,
            padding: "10px 12px",
            maxHeight: 240,
            overflow: "auto",
            fontSize: "0.78rem",
            background: "rgba(84,74,58,0.06)",
            borderRadius: 8,
            whiteSpace: "pre-wrap",
          }}
        >
          {error.stack}
        </pre>
      )}
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary fallback={(error) => <StartupError error={error} />}>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
