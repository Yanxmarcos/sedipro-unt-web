export async function copyToClipboard(text) {
  if (navigator.clipboard?.writeText && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Some mobile browsers expose the API but reject it on local HTTP URLs.
    }
  }

  const activeElement = document.activeElement;
  const selection = document.getSelection();
  const savedRange = selection?.rangeCount ? selection.getRangeAt(0) : null;
  const textarea = document.createElement("textarea");

  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.setAttribute("aria-hidden", "true");
  Object.assign(textarea.style, {
    position: "fixed",
    inset: "0 auto auto 0",
    width: "1px",
    height: "1px",
    padding: "0",
    border: "0",
    opacity: "0",
    fontSize: "16px",
    pointerEvents: "none",
  });

  document.body.appendChild(textarea);
  textarea.focus({ preventScroll: true });
  textarea.select();
  textarea.setSelectionRange(0, text.length);

  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch {
    copied = false;
  }

  textarea.remove();
  if (activeElement instanceof HTMLElement) activeElement.focus({ preventScroll: true });
  if (selection && savedRange) {
    selection.removeAllRanges();
    selection.addRange(savedRange);
  }

  return copied;
}
