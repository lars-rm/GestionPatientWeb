import { useState } from 'react';

export interface ToastState {
  message: string;
  type: 'success' | 'error';
}

// Notification temporaire affichée en haut de l'écran
export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = (message: string, type: ToastState['type'] = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  return { toast, showToast };
}
