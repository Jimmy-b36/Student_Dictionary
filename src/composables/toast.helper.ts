import { useToast } from 'primevue/usetoast';

export function useToastHelper() {
  const toast = useToast();
  const defaultLife = 3000;

  const success = (detail: string, summary: string = 'Success', life: number = defaultLife) => {
    toast.add({ severity: 'success', summary, detail, life });
  };

  const error = (detail: string, summary: string = 'Error', life: number = defaultLife) => {
    toast.add({ severity: 'error', summary, detail, life });
  };

  const warn = (detail: string, summary: string = 'Warning', life: number = defaultLife) => {
    toast.add({ severity: 'warn', summary, detail, life });
  };

  const info = (detail: string, summary: string = 'Info', life: number = defaultLife) => {
    toast.add({ severity: 'info', summary, detail, life });
  };

  return {
    success,
    error,
    warn,
    info,
    toast,
  };
}
