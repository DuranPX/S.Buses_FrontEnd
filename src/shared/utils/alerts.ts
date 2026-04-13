import Swal from 'sweetalert2';

export const showAlert = {
  success: (title: string, text?: string) => {
    return Swal.fire({
      icon: 'success',
      title,
      text,
      background: '#1e293b',
      color: '#f8fafc',
      confirmButtonColor: '#3b82f6',
    });
  },
  error: (title: string, text?: string) => {
    return Swal.fire({
      icon: 'error',
      title,
      text,
      background: '#1e293b',
      color: '#f8fafc',
      confirmButtonColor: '#ef4444',
    });
  },
  warning: (title: string, text?: string) => {
    return Swal.fire({
      icon: 'warning',
      title,
      text,
      background: '#1e293b',
      color: '#f8fafc',
      confirmButtonColor: '#f59e0b',
    });
  },
  info: (title: string, text?: string) => {
    return Swal.fire({
      icon: 'info',
      title,
      text,
      background: '#1e293b',
      color: '#f8fafc',
      confirmButtonColor: '#3b82f6',
    });
  }
};
