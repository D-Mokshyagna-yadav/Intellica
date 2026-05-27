export function showToast(detail) {
  window.dispatchEvent(
    new CustomEvent("app:toast", {
      detail: typeof detail === "string" ? { message: detail, type: "info" } : detail,
    })
  );
}
