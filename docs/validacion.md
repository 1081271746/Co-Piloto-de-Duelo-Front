# Validación y límites

## Comandos reproducibles

```bash
pnpm install
pnpm run typecheck
pnpm test
pnpm run build
```

Las pruebas de servicios verifican cuerpos, rutas, parámetros, respuestas y traducción de errores con HttpTestingController. No hacen solicitudes externas. Incluyen sesión JWT, expiración, almacenamiento bloqueado, aislamiento del interceptor, redirecciones seguras, errores heredados y validación del protocolo de eventos.

## Resultado de la entrega

- Compilación estricta Angular: aprobada.
- Suite automatizada: **68 pruebas aprobadas en 10 archivos**.
- Build de producción: generado correctamente en `dist/public`.
- Recorrido real en navegador: registro, inicio de sesión, creación de entrada, recarga conservando sesión, edición, mensaje de Groq no configurado, navegación privada, eliminación confirmada y cierre de sesión aprobados.
- Panel y seguimiento: las peticiones reales a resumen, tendencias e historial reflejaron la entrada ficticia creada para la prueba, no datos precargados en la interfaz.
- Biblioteca, acompañamiento y perfil: cargaron desde los endpoints existentes.
- Pantalla de acceso móvil: verificada a 390 × 844 sin desbordamiento horizontal.
- Actualizaciones en vivo: se comprobó el estado honesto de indisponibilidad por origen; el protocolo y la reconexión se probaron con transporte simulado. No se afirma que Fan-Out entre navegadores haya quedado verificado en el dominio de vista previa.
- Se eliminó únicamente la entrada ficticia del recorrido. La cuenta ficticia permanece porque el backend no ofrece eliminación completa de cuenta.
- No se modificó código ni configuración del backend, no se configuró Groq y no se realizaron llamadas reales de IA.

La revisión visual detectó etiquetas técnicas en contactos de ayuda; se sustituyeron por textos en español y se comprobaron con el compilador. No fue necesario repetir el recorrido de autenticación por ese ajuste de presentación.

## Recorrido manual con el servidor real

1. Inicia FastAPI y Redis según el README de su repositorio, sin modificar modelos ni endpoints.
2. Abre Angular en `http://localhost:4200` y registra una cuenta ficticia exclusiva para pruebas.
3. Inicia sesión, recarga la pestaña y comprueba que se conserva la sesión.
4. Escribe una entrada ficticia, consulta su detalle, edítala y recarga para comprobar persistencia.
5. Solicita un análisis sin clave de IA: debe informar indisponibilidad, no inventar un resultado ni impedir volver al diario.
6. Revisa biblioteca y seguimiento, siempre con datos recibidos del servidor.
7. Si el origen está autorizado, comprueba el estado `connected` y abre dos sesiones del mismo usuario para verificar actualización tras eventos.
8. Elimina únicamente la entrada ficticia creada durante el recorrido y comprueba su ausencia.
9. Cierra sesión e intenta abrir una ruta privada: debe redirigir al login.

No se deben ejecutar pruebas destructivas contra entradas de otras personas. El backend no implementa eliminación completa de cuenta; crear una cuenta de prueba no promete borrarla automáticamente.

## Integraciones no simuladas

- Los resultados reales de Groq dependen de la configuración y cuota del servidor. El frontend no configura ni comprueba una clave real.
- El WebSocket requiere que el origen del navegador esté autorizado por el backend. Un dominio distinto de `localhost:4200` puede necesitar esa configuración antes de conectarse.
- No se ha validado PostgreSQL ni uso clínico. El frontend no cambia SQLite.
- Publicar solo la carpeta estática no publica la API, la base ni Redis. Se necesita dirigir REST y WebSocket al servidor real.
- No existen recuperación de contraseña por correo, refresh token, chat con profesionales ni notificaciones externas en el backend; no se añadieron botones que afirmen ofrecerlos.
