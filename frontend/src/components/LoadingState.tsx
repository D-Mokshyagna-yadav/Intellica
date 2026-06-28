export default function LoadingState({ message = "Loading..." }) {
  return (
    <div
      style={{
        padding: "24px 28px",
        borderRadius: 24,
        background: "#ffffff",
        color: "#334155",
        border: "1px solid #e2e8f0",
        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.04)",
        textAlign: "center",
        fontWeight: 600,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 88,
      }}
    >
      {message}
    </div>
  );
}
