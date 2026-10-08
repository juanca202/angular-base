# WI-001: Viabilidad del protocolo de transferencia por secuencia de QR

<!-- wi:status=Ready · type=spike -->
**Estado:** Ready
**Tipo:** spike
**Subtipo:** técnico
**Repositorio:** transferencia-qr-web
**Origen:** [SRS-001: Transferencia de archivos mediante secuencia de QR](../../requirements/SRS-001-transferencia-qr/README.md) (sección 2.5), [US-001](../../user-stories/US-001-enviar-archivo-qr/README.md), [US-002](../../user-stories/US-002-recibir-archivo-qr/README.md)
**Timebox:** 2 días
**Resolución:** Re-espigado (WI-002)

## Pregunta de investigación

¿Es viable transferir un archivo entre dos dispositivos con Chrome Android mostrando una secuencia de QR en bucle y leyéndola con la cámara, y con qué parámetros (capacidad por QR, velocidad, fragmentación, librerías) se logra de forma fiable?

## Contexto

Las [US-001](../../user-stories/US-001-enviar-archivo-qr/README.md) y [US-002](../../user-stories/US-002-recibir-archivo-qr/README.md) no pueden pasar a Ready, y el SRS-001 tampoco, hasta tener los NFR de rendimiento y compatibilidad, la capacidad efectiva por QR y la fórmula del tiempo estimado con su precisión aceptable. El protocolo debe seguir separado de la UI y llevar número de versión (NFR-005). El stack es Angular sobre el proyecto base angular-base.

## Hipótesis

Creemos que un fragmento por QR, con cabecera mínima (identificador de transferencia, posición, total, verificación propia) y emisión en bucle a velocidad fija, permite completar la transferencia de archivos pequeños con Chrome Android porque el bucle da varias oportunidades de lectura a cada fragmento.

## Preguntas a responder

- **Q-01 (Rendimiento):** ¿Cuál es la capacidad útil de datos por QR que se lee de forma estable con la cámara de un móvil Android?
  - **Éxito:** se identifica una capacidad por QR con la que el fragmento se lee sin errores en el 100 % de las pruebas de ajuste.
  - **Fallo:** ninguna capacidad por encima de la mínima de la librería se lee de forma estable.
- **Q-02 (Rendimiento):** ¿Qué velocidad de cambio de QR maximiza la fiabilidad de lectura y cómo se determina automáticamente (FR-005)?
  - **Éxito:** una regla o valor de velocidad que no requiere intervención del usuario y con el que un archivo de 1 MB se transfiere en 15 minutos o menos, con hash idéntico en al menos 9 de 10 intentos en móviles Android reales.
  - **Fallo:** menos de 7 de 10 intentos completan la transferencia de 1 MB con hash idéntico, o ninguno lo hace en 15 minutos o menos.
- **Q-03 (Viabilidad):** ¿Permite el protocolo reconstruir un archivo idéntico byte a byte con fragmentos en desorden, repetidos y corruptos descartados (FR-008 a FR-010, NFR-003)?
  - **Éxito:** hash del archivo recibido idéntico al original en el 100 % de las transferencias completadas del experimento.
  - **Fallo:** cualquier transferencia declarada completada con hash distinto.
- **Q-04 (Rendimiento):** ¿Con qué fórmula y precisión se estima el tiempo por vuelta y el tiempo restante (FR-002, FR-011)?
  - **Éxito:** una fórmula documentada cuyo error frente al tiempo medido el spike reporta.
  - **Fallo:** el error es tan alto que la estimación no es útil para el usuario.
- **Q-05 (Compatibilidad):** ¿Qué librerías de generación y lectura de QR funcionan en Chrome Android y qué APIs de cámara, almacenamiento privado, descarga y compartir están disponibles?
  - **Éxito:** al menos una combinación de librerías con la que Q-01 a Q-03 se cumplen en Chrome Android.
  - **Fallo:** ninguna combinación evaluada funciona.
- **Q-06 (Compatibilidad):** ¿Funciona la PWA sin conexión tras la primera carga, sin peticiones de red durante el envío y la recepción (NFR-001, NFR-002)?
  - **Éxito:** cero peticiones de red capturadas durante una transferencia completa con la aplicación instalada y sin red.
  - **Fallo:** cualquier petición de red o fallo al abrir sin conexión.

## Fuera de alcance

- Safari iOS, Chrome/Edge de escritorio y otros navegadores: este spike solo evalúa Chrome Android; el resto se aborda en otro spike si hace falta.
- Interfaz definitiva, historial, exportación, previsualización y manejo completo de errores.
- Cifrado, compresión y corrección de errores (diferidos, SRS-001 sección 2.6).
- El código producido **no se integra**: queda en la rama `spike/WI-001-protocolo-transferencia-qr` como referencia de la implementación definitiva.

## Dependencias

- Dos dispositivos Android con Chrome y cámara — emisor y receptor reales.
- Archivos de prueba de distintos tamaños — para medir capacidad, velocidad y tiempo.
- Proyecto base [angular-base](https://github.com/juanca202/angular-base) — punto de partida del prototipo.
- Librerías candidatas de generación y lectura de QR — a seleccionar y comparar durante IT-02.

## Referencias

- **Requerimiento:** [raw-requirement.md](../../requirements/SRS-001-transferencia-qr/references/raw-requirement.md)
- **Diseño:** [WF-002](../../requirements/SRS-001-transferencia-qr/wireframes/WF-002-enviar-seleccion.md) y [WF-004](../../requirements/SRS-001-transferencia-qr/wireframes/WF-004-recibir-escaneo.md) (referencia de contenido de pantalla; no se implementan).

## Enfoque del experimento

- [ ] **IT-01** — Preparar un proyecto desde angular-base y los dispositivos de prueba; generar archivos de prueba de varios tamaños.
- [ ] **IT-02** — Seleccionar y comparar librerías de generación y lectura de QR en Chrome Android.
- [ ] **IT-03** — Construir un emisor y un receptor mínimos con un protocolo versionado y separado de la UI (fragmento con identificador, posición, total, verificación propia).
- [ ] **IT-04** — Medir capacidad por QR y velocidad de cambio; probar desorden, duplicados y fragmentos corruptos; guardar evidencia en `assets/`.
- [ ] **IT-05** — Probar modo sin conexión y capturar el tráfico de red durante una transferencia; documentar las APIs disponibles en Chrome Android.
- [ ] **IT-06** — Redactar `spike-report.md` con los resultados por `Q-XX`, el veredicto y las consideraciones para la implementación definitiva, incluidos los NFR de rendimiento y compatibilidad propuestos.

## Entregable

- `spike-report.md` en esta carpeta, con veredicto y marca oculta `spike:verdict`.
- Evidencia del experimento en `assets/` de esta carpeta.
- Rama `spike/WI-001-protocolo-transferencia-qr` con el código del experimento, sin integrar.

## Observaciones

- Sin pendientes de definición. El umbral de la Q-02 (1 MB en ≤ 15 min, 9 de 10 intentos) lo fijó el usuario el 2026-10-08.
- El repositorio `transferencia-qr-web` aún no existe: hay que crearlo desde angular-base antes de ejecutar el experimento.
- Alcance de compatibilidad limitado a Chrome Android por decisión del usuario; el SRS-001 pide además los NFR de compatibilidad, que tendrán que ampliarse con otro spike o decisión.
