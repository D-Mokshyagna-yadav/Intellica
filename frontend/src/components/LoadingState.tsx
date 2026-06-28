export default function LoadingState({ message = "Loading..." }) {
  return (
    <div
      style={{
        padding: 32,
        borderRadius: 16,
        background: "rgba(255,255,255,0.82)",
        color: "#334155",
        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
        textAlign: "center",
        fontWeight: 600,
      }}
    >
      {message}
    </div>
  );
}
