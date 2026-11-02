export const TOAST_EVENT = "app:toast";

export function toast(message: string) {
  window.dispatchEvent(new CustomEvent<string>(TOAST_EVENT, { detail: message }));
}

export async function copyText(text: string, success: string, failure: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast(success);
    return true;
  } catch {
    toast(failure);
    return false;
  }
}
