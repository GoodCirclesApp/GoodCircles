type ToastHandler = (message: string, type?: 'success' | 'error' | 'info') => void;

let _handler: ToastHandler | null = null;

export const registerToastHandler = (fn: ToastHandler) => { _handler = fn; };

export const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
  _handler?.(message, type);
};
