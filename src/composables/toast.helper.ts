import { useToast } from 'primevue/usetoast';

export function useToastHelper() {
  const toast = useToast();
  const defaultLife = 3000;
  const summaryOptions = {
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    info: 'Info'
  } as const;

  const success = (detail: string, summary = summaryOptions.success, life = defaultLife) => {
    toast.add({ severity: 'success', summary, detail, life });
  };

  const error = (detail: string, summary = summaryOptions.error, life = defaultLife) => {
    toast.add({ severity: 'error', summary, detail, life });
  };

  const warn = (detail: string, summary = summaryOptions.warning, life = defaultLife) => {
    toast.add({ severity: 'warn', summary, detail, life });
  };

  const info = (detail: string, summary = summaryOptions.info, life = defaultLife) => {
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
