import { useState, useEffect } from "react";

export default function ConfirmModal({
  isOpen,
  title,
  message,
  type = "confirm",
  placeholder = "",
  options = [],
  defaultValue = "",
  confirmationPhrase = "",
  onConfirm,
  onCancel,
}) {
  const [inputValue, setInputValue] = useState(defaultValue);

  useEffect(() => {
    if (isOpen) {
      setInputValue(defaultValue || (type === "select" ? options[0] || "" : ""));
    }
  }, [isOpen, defaultValue, type, options]);

  const requiresTypedConfirmation = Boolean(confirmationPhrase);
  const typedConfirmationSatisfied =
    !requiresTypedConfirmation ||
    String(inputValue || "").trim().toUpperCase() === String(confirmationPhrase).trim().toUpperCase();

  if (!isOpen) return null;

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h3 style={titleStyle}>{title}</h3>
        {message && <p style={messageStyle}>{message}</p>}

        {type === "prompt" && (
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={placeholder}
            style={inputStyle}
            autoFocus
          />
        )}

        {type === "select" && (
          <select
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            style={selectStyle}
            autoFocus
          >
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        )}

        {requiresTypedConfirmation && (
          <p style={confirmNoteStyle}>
            Type <span style={confirmPhraseStyle}>{confirmationPhrase}</span> to confirm.
          </p>
        )}

        <div style={actionsStyle}>
          <button type="button" onClick={onCancel} style={cancelBtnStyle}>
            Cancel
          </button>
          <button
            type="button"
            onClick={() => typedConfirmationSatisfied && onConfirm(inputValue)}
            disabled={!typedConfirmationSatisfied}
            style={{
              ...confirmBtnStyle,
              ...(typedConfirmationSatisfied ? {} : disabledConfirmBtnStyle),
            }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(15, 23, 42, 0.4)",
  backdropFilter: "blur(4px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 10000,
};

const modalStyle = {
  background: "#fff",
  borderRadius: 20,
  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  width: "100%",
  maxWidth: 400,
  padding: 24,
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
};

const titleStyle = {
  margin: "0 0 12px 0",
  fontSize: 18,
  fontWeight: 700,
  color: "#0f172a",
};

const messageStyle = {
  margin: "0 0 20px 0",
  fontSize: 14,
  color: "#64748b",
  lineHeight: 1.5,
};

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid #cbd5e1",
  fontSize: 14,
  marginBottom: 20,
  boxSizing: "border-box",
  outline: "none",
  color: "#0f172a",
};

const selectStyle = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid #cbd5e1",
  fontSize: 14,
  marginBottom: 20,
  boxSizing: "border-box",
  outline: "none",
  background: "#fff",
  color: "#0f172a",
};

const confirmNoteStyle = {
  margin: "0 0 16px 0",
  fontSize: 13,
  color: "#475569",
};

const confirmPhraseStyle = {
  fontWeight: 700,
  color: "#0f172a",
};

const actionsStyle = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 12,
};

const cancelBtnStyle = {
  padding: "10px 18px",
  borderRadius: 12,
  border: "1px solid #e2e8f0",
  background: "#fff",
  color: "#64748b",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
};

const confirmBtnStyle = {
  padding: "10px 18px",
  borderRadius: 12,
  border: "none",
  background: "#3b82f6",
  color: "#fff",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
};

const disabledConfirmBtnStyle = {
  background: "#94a3b8",
  cursor: "not-allowed",
  opacity: 0.75,
};
