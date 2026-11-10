import { HttpErrorResponse } from '@angular/common/http';

const MESSAGES: Record<string, string> = {
  gemini_not_configured: 'El análisis con Groq aún no está configurado. Tu entrada está guardada y puedes seguir usando el diario.',
  gemini_access_denied: 'El servicio de análisis no está disponible por su configuración. Tu diario sigue disponible.',
  gemini_quota_exceeded: 'Se alcanzó temporalmente el límite de análisis. Espera antes de intentarlo de nuevo.',
  gemini_timeout: 'El análisis tardó más de lo esperado. Tu entrada sigue guardada; puedes reintentarlo más tarde.',
  gemini_invalid_response: 'El servicio no devolvió un análisis válido. No se guardó un resultado incompleto.',
  gemini_incomplete_response: 'El análisis no pudo completarse de forma segura. Tu entrada sigue guardada.',
  gemini_unavailable: 'El servicio de análisis no está disponible en este momento.',
  safety_priority: 'Tu seguridad tiene prioridad. Por ahora, busca acompañamiento antes de realizar ejercicios.',
  analysis_in_progress: 'Esta entrada ya se está analizando. Espera unos momentos.',
  entry_changed_during_analysis: 'La entrada cambió durante el análisis. Revisa la versión actual antes de reintentar.',
  concurrent_update: 'La entrada cambió en otra sesión. Vuelve a cargarla antes de editar.',
  invalid_credentials: 'El correo o la contraseña no son correctos.',
  email_already_registered: 'Este correo ya está registrado. Intenta iniciar sesión.',
  incorrect_password: 'La contraseña actual no es correcta.',
};

export function errorMessage(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) return 'No pudimos completar la operación. Inténtalo de nuevo.';
  const detail = error.error?.detail;
  const code = typeof detail === 'string' ? detail : detail?.code;
  if (code && MESSAGES[code]) return MESSAGES[code];
  if (error.status === 0) return 'No hay conexión con el servidor. Verifica tu conexión y vuelve a intentarlo.';
  if (error.status === 401) return 'Tu sesión no es válida o ha terminado. Inicia sesión de nuevo.';
  if (error.status === 404) return 'Este contenido no existe o no está disponible para tu cuenta.';
  if (error.status === 409) return 'No se pudo guardar por un conflicto. Actualiza la información y revisa antes de reintentar.';
  if (error.status === 422) return 'Revisa los campos del formulario: hay información incompleta o no válida.';
  if (error.status === 429) return 'Demasiadas solicitudes. Espera un momento antes de volver a intentarlo.';
  if (error.status >= 500) return 'El servidor no está disponible en este momento. No repitas el envío sin revisar el historial.';
  return 'No pudimos completar la operación. Revisa la información e inténtalo de nuevo.';
}
