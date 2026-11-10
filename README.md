# Co-Piloto de Duelo — Frontend Angular

Aplicación en español para el backend FastAPI existente. Incluye autenticación, diario privado, reflexiones de IA, biblioteca, seguimiento descriptivo y orientación de seguridad. **No sustituye atención profesional, no diagnostica y no contacta automáticamente a emergencias.**

## Requisitos

- Node.js 22.12 o posterior compatible con Angular 21; se verificó con Node 24.
- pnpm 10 o npm.
- Backend FastAPI y Redis en ejecución. El frontend no inicia ni modifica estos servicios.

## Ejecutar localmente

Desde la raíz de este repositorio:

```bash
pnpm install
```

Para conectar con la API local solicitada, copia la configuración **pública y sin secretos**:

```bash
cp public/config.local.example.js public/config.js
pnpm start
```

Abre **`http://localhost:4200`**. La API predeterminada del ejemplo local es **`http://127.0.0.1:8000/api`**. Usa `localhost:4200`, no `127.0.0.1:4200`, si el backend solo autoriza el primer origen. El servidor Angular escucha en `0.0.0.0`, pero esa no es la dirección para abrir en el navegador.

Con npm, los comandos equivalentes son `npm install`, `npm start`, `npm test` y `npm run build`.

No copies secretos del backend. `GROQ_API_KEY`, `JWT_SECRET`, la conexión SQL y Redis pertenecen exclusivamente al servidor. No se configuró Groq ni se migró la base de datos.

## Configuración de conexión

`public/config.js` se carga antes de Angular y contiene únicamente direcciones públicas. En este workspace usa `/api`, atendido por el proxy compartido:

```javascript
window.__COPILOT_CONFIG__ = {
  apiBaseUrl: '/api'
};
```

El cliente deriva `/api/ws` usando `ws:` o `wss:` según corresponda. Para instalaciones que necesiten una dirección diferente puede añadirse `websocketUrl`, sin token ni parámetros. Se rechazan esquemas inseguros, credenciales embebidas y secretos en query strings.

Después de cambiar `public/config.js`, recarga la aplicación. Para un build ya generado, actualiza `dist/public/config.js` o vuelve a compilar.

### Origen del navegador y WebSocket

La API existente valida `CORS_ORIGINS` y el encabezado `Origin` del WebSocket. **Este frontend no cambia esa configuración ni el código del backend.** El origen local `http://localhost:4200` ya está contemplado por la configuración inicial del servidor.

En un dominio de vista previa o en una futura instalación, el responsable del backend deberá autorizar deliberadamente el origen exacto para habilitar el WebSocket. Sin esa autorización se muestra un estado de conexión no disponible; el diario y las peticiones REST de mismo origen siguen disponibles. No se simula una conexión exitosa ni se omite la validación del servidor.

## Módulos

| Módulo | Funciones |
|---|---|
| Autenticación | Registro, login, logout remoto/local, JWT, rutas protegidas y expiración |
| Panel | Bienvenida y contadores reales del periodo, accesos al resto de módulos |
| Diario | Crear, listar, consultar, editar, eliminar con confirmación y solicitar análisis |
| Reflexiones | Historial y detalle de emociones, categorías, confianza, motivos, patrones y recomendaciones |
| Biblioteca | Ejercicios por categoría, instrucciones, recursos por país y registro de actividad |
| Seguimiento | Periodos, conteos, estados por fecha e historial real, sin puntuación de recuperación |
| Acompañamiento | Alertas, orientación del país, marcar como leída y conexión WebSocket |
| Cuenta | Nombre, país y cambio de contraseña con revocación de sesiones |

Las categorías del duelo son referencias opcionales, no diagnósticas, no universales y no lineales. Una alerta leída no significa riesgo resuelto. El servidor conserva la decisión final sobre recomendaciones y registro de ejercicios.

## Sesión y privacidad

- El JWT se guarda en **sessionStorage**, no en localStorage. Persiste al recargar la misma pestaña y se elimina al cerrar sesión o expirar.
- La persistencia no es una garantía contra XSS: usa HTTPS, cabeceras de seguridad y un entorno confiable.
- No se guardan contraseñas, contenido del diario, análisis ni claves API en almacenamiento del navegador.
- Si el navegador bloquea sessionStorage, la sesión solo permanece en memoria y la interfaz lo informa.
- El token solo se adjunta a la API configurada, nunca a enlaces externos. La autorización real la verifica el backend; interpretar la expiración JWT en el navegador no valida su firma.
- Una caída de red no implica que un POST no se haya guardado. No hay reintentos automáticos de escrituras; consulta el historial antes de repetir.
- Si falla el logout remoto, el cliente borra su sesión local e informa que no pudo confirmar la revocación. No afirma que el servidor la haya revocado.
- El editor conserva cambios en memoria ante errores y advierte al salir sin guardar; no crea copias del diario en localStorage.

## Análisis de IA

Se solicita exclusivamente mediante `POST /api/journal/{entry_id}/analyze`. El cliente no llama a Groq directamente. Si no está configurado, se muestra un mensaje informativo y la entrada permanece utilizable. Las pruebas no necesitan una clave ni consumen cuota.

Se mantienen los códigos públicos `gemini_*` que el backend conserva por compatibilidad aunque su proveedor actual sea Groq. No son una integración activa con Google.

## Compilar y probar

```bash
pnpm run typecheck
pnpm test
pnpm run build
```

La salida estática está en `dist/public`. Configura el servidor web para devolver `index.html` en rutas Angular, excluyendo `/api` del fallback. Las rutas REST y WebSocket deben dirigirse al backend real. No publiques una vista estática esperando que incluya FastAPI, Redis o la base de datos.

Las pruebas unitarias usan Angular TestBed, HttpTestingController y transportes controlados; no contienen datos personales reales. Consulta [validación](docs/validacion.md) y [contrato integrado](docs/api.md).

## Estructura

```text
src/app/
  core/        Contratos, configuración, HttpClient, autenticación y servicios
  layout/      Navegación y estructura privada
  shared/      Componentes accesibles, formatos y visualización
  features/
    auth/
    dashboard/
    journal/
    analysis/
    library/
    tracking/
    support/
    settings/
public/        Configuración pública, icono y robots
tools/         Arranque no interactivo en el workspace
docs/          Contratos y límites de validación
```

Se usa Angular standalone con carga diferida de rutas y sin bibliotecas de componentes adicionales. No hay backend duplicado, datos falsos presentados como reales, chatbot ni chat con profesionales.
