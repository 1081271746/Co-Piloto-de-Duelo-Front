# Integración con el backend existente

El contrato se obtuvo de los routers, esquemas Pydantic, modelos y servicios del backend FastAPI. La configuración local es `http://127.0.0.1:8000/api`; en este workspace el proxy expone `/api` sin modificar las rutas del servidor.

## Endpoints consumidos

| Método | Ruta relativa a `/api` | Uso |
|---|---|---|
| POST | `/auth/register` | `{email,password,name,country}` → usuario |
| POST | `/auth/login` | `{email,password}` → `{access_token,token_type,expires_in}` |
| POST | `/auth/logout` | Revoca sesión; respuesta 204 |
| GET / PATCH | `/users/me` | Perfil; PATCH con nombre y país |
| POST | `/users/me/password` | `{current_password,new_password}`; respuesta 204 |
| GET / POST | `/journal` | Lista / crea `{content,emotional_state,recorded_at?}` |
| GET / PATCH / DELETE | `/journal/{entry_id}` | Consulta, edición parcial y eliminación |
| POST | `/journal/{entry_id}/analyze` | Solicita análisis explícito |
| GET | `/journal/{entry_id}/analyses` | Historial de la entrada |
| GET | `/analyses` | Historial privado de análisis |
| GET | `/analyses/{analysis_id}` | Resultado asociado a una versión |
| GET | `/recommendations` | `{items,reason,safety_guidance}` |
| GET | `/exercises` | Filtro de categoría y paginación |
| GET | `/exercises/{exercise_id}` | Instrucciones |
| POST | `/exercises/{exercise_id}/complete` | `{notes?,analysis_id?}` |
| GET | `/exercise-history` | Historial de actividades |
| GET | `/resources` | Recursos por país del usuario y categoría opcional |
| GET | `/tracking/summary` | Conteos y estados para `days` |
| GET | `/tracking/trends` | `daily_states`, emociones, categorías y truncamiento |
| GET | `/tracking/timeline` | Lista `{type,id,occurred_at,related_id}` |
| GET | `/alerts` | Lista de alertas propias |
| GET | `/alerts/{alert_id}` | Detalle de alerta propia |
| POST | `/alerts/{alert_id}/acknowledge` | Marca lectura sin resolver riesgo |
| GET | `/safety/resources` | Orientación según el país del perfil |
| WS | `/ws` | Eventos privados con autenticación inicial |

El backend no tiene endpoint de detalle de recursos. La interfaz muestra su descripción del listado y enlaza al recurso externo con `noopener noreferrer`; no inventa una ruta adicional.

## Formatos que no deben reinterpretarse

- Las listas son arrays directos, no `{items,total}`. La paginación usa `limit=20` y `offset`; no se inventa un total.
- El diario devuelve `{entry,safety_alert,realtime_delivered}` después de crear o editar. Un fallo de publicación no revierte el guardado SQL.
- Un análisis devuelve `{analysis,recommendations,safety_alert,realtime_delivered,disclaimer}`. El análisis interno contiene `result`, `model`, `entry_id`, `entry_version`, `id` y `created_at`.
- `AnalysisResult`: `emotions`, `categories[{category,confidence,rationale}]`, `summary`, `patterns`, `recommended_categories`, `risk_level`.
- `confidence` es una estimación del modelo, no una probabilidad clínica ni una medida de recuperación.
- `recorded_at`, si se envía, debe incluir zona horaria. El editor convierte la fecha local a ISO; no envía una fecha inválida o sin zona.
- `analysis_outdated` indica que las recomendaciones corresponden a una versión anterior. `analysis_required` no es un análisis fallido. `safety_priority` exige mostrar orientación, no sugerir ejercicios alternativos.
- El seguimiento es descriptivo. `truncated` y `analyses_considered` indican el alcance real del resumen del servidor.
- Los errores pueden tener `detail` de texto, array de validación u objeto con `{code,guidance}`. El cliente traduce códigos conocidos sin mostrar cuerpos privados del proveedor.

## Protocolo WebSocket

1. Abrir `ws://…/api/ws` o `wss://…/api/ws`, sin credenciales en la URL.
2. Enviar como primer mensaje `{"type":"authenticate","access_token":"<JWT>"}` dentro del plazo del servidor.
3. Esperar `{"type":"ready","user_id":"…","delivery":"at_most_once"}` antes de mostrar conectado.
4. Enviar únicamente `{"type":"ping"}` como mantenimiento; el servidor responde `{"type":"pong"}`.
5. Consumir eventos `{id,type,user_id,occurred_at,data}` solo del usuario autenticado y tipos conocidos.

Eventos: `journal.created`, `journal.updated`, `journal.deleted`, `analysis.completed`, `recommendation.created`, `safety.alert` y `tracking.updated`. Los eventos no contienen el texto del diario; disparan nuevas consultas autorizadas.

La reconexión tiene espera exponencial y un límite de intentos. Al recibir `ready` se vuelve a consultar el estado, porque Pub/Sub es **como máximo una vez** y no recupera eventos perdidos. No se presenta como cola durable ni como atención humana en vivo.

Una revocación del servidor puede cerrar el socket con 1008; el cliente consulta el perfil y el interceptor trata un eventual 401. Un origen no autorizado también puede impedir la conexión: no se borra una sesión válida solo por un cierre de transporte. En ese caso se informa indisponibilidad y se permite reintentar.
