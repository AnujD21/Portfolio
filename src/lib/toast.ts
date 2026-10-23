export const TOAST_EVENT = "app:toast";

export function toast(message: string) {
  window.dispatchEvent(new CustomEvent<string>(TOAST_EVENT, { detail: message }));
}

export async function copyText(text: string, message = "Copied to clipboard") {
  try {
    await navigator.clipboard.writeText(text);
    toast(message);
    return true;
  } catch {
    toast("Copy failed. Select the text instead.");
    return false;
  }
}
