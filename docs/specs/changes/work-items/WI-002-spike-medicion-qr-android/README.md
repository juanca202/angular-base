# WI-002: Medición con móviles Android de la transferencia por secuencia de QR

<!-- wi:status=Ready · type=spike -->
**Estado:** Ready
**Tipo:** spike
**Subtipo:** técnico
**Repositorio:** laboratorio-1
**Origen:** [WI-001: Viabilidad del protocolo de transferencia por secuencia de QR](../WI-001-spike-protocolo-transferencia-qr/README.md) (veredicto no concluyente; informe en la rama `spike/WI-001-protocolo-transferencia-qr`), [US-001](../../user-stories/US-001-enviar-archivo-qr/README.md), [US-002](../../user-stories/US-002-recibir-archivo-qr/README.md)
**Timebox:** 1 día
**Resolución:** Abierto

## Pregunta de investigación

¿Con dos móviles Android con Chrome, a qué capacidad por QR y velocidad de cambio se transfiere un archivo de 1 MB en 15 minutos o menos con lectura fiable, y qué cambia en el protocolo para que el receptor no complete una transferencia ajena?

## Contexto

El [WI-001](../WI-001-spike-protocolo-transferencia-qr/README.md) se cerró como no concluyente: validó el protocolo en Node con una cámara simulada, pero no pudo medir con cámara real. Su informe está solo en la rama `spike/WI-001-protocolo-transferencia-qr` (no en `main`); se lee con `git show spike/WI-001-protocolo-transferencia-qr:docs/specs/changes/work-items/WI-001-spike-protocolo-transferencia-qr/spike-report.md`. Dejó el hallazgo H-01: el receptor fija la primera transferencia que ve y puede completar una ajena. Mientras no haya mediciones reales, [US-001](../../user-stories/US-001-enviar-archivo-qr/README.md) y [US-002](../../user-stories/US-002-recibir-archivo-qr/README.md) siguen en Draft.

## Hipótesis

Creemos que fragmentos de 400 a 800 B con corrección de errores M, mostrados a 5 a 8 fotogramas por segundo, se leen con una probabilidad por vuelta suficiente (≥ 0,9) para transferir 1 MB en menos de 15 minutos con Chrome Android, porque el bucle da varias oportunidades de lectura a cada fragmento.

## Preguntas a responder

- **Q-01 (Rendimiento):** ¿Cuál es la capacidad máxima por QR que un móvil Android lee de forma estable?
  - **Éxito:** una capacidad con al menos 9 de 10 lecturas correctas de un mismo QR estático a unos 30 cm, en una pantalla con brillo medio.
  - **Fallo:** ninguna capacidad de 400 B o más alcanza ese 9 de 10.
- **Q-02 (Rendimiento):** ¿Qué velocidad de cambio permite transferir 1 MB en 15 minutos o menos?
  - **Éxito:** una velocidad fija que completa 1 MB con hash idéntico en 15 minutos o menos en al menos 9 de 10 intentos, sin intervención del usuario.
  - **Fallo:** menos de 7 de 10 intentos completan en 15 minutos o menos con hash idéntico.
- **Q-03 (Rendimiento):** ¿Qué probabilidad de lectura por fotograma (p) se mide con cámara real y qué error tiene la fórmula de vueltas esperadas del WI-001 frente al tiempo medido?
  - **Éxito:** se mide p para cada combinación probada y se reporta el error de la fórmula frente al tiempo real de al menos 5 transferencias.
  - **Fallo:** no se obtienen datos suficientes para calcular p.
- **Q-04 (Compatibilidad):** ¿Qué librerías de lectura y generación funcionan en Chrome Android y qué APIs de cámara, almacenamiento privado, descarga y compartir están disponibles?
  - **Éxito:** al menos una combinación de librerías con la que se cumplen Q-01 y Q-02, y una lista de las APIs que funcionan en el dispositivo de prueba.
  - **Fallo:** ninguna combinación probada cumple Q-01.
- **Q-05 (Compatibilidad):** ¿Funciona la PWA instalada sin conexión, sin peticiones de red durante el envío y la recepción?
  - **Éxito:** cero peticiones de red capturadas en una transferencia completa con la app instalada y sin red.
  - **Fallo:** cualquier petición de red o fallo al abrir sin conexión.
- **Q-06 (Comportamiento):** ¿Evita el cambio de protocolo que el receptor complete una transferencia ajena (H-01)?
  - **Éxito:** tras leer el fragmento de metadatos el receptor muestra nombre y tamaño del archivo y permite descartarlo; con una secuencia ajena en cuadro, 0 de 10 intentos completan el archivo equivocado sin que el usuario lo haya visto.
  - **Fallo:** cualquier intento completa un archivo ajeno sin mostrar antes nombre y tamaño.

## Fuera de alcance

- Safari iOS, escritorio y otros navegadores.
- Interfaz definitiva, historial, exportación, previsualización y manejo completo de errores.
- Cifrado, compresión y corrección de errores del protocolo (diferidos, SRS-001 sección 2.6).
- El código producido **no se integra**: queda en la rama `spike/WI-002-medicion-qr-android` como referencia de la implementación definitiva.

## Dependencias

- Dos móviles Android con Chrome y cámara — emisor y receptor reales.
- Archivos de prueba de 100 KB y 1 MB — para medir capacidad, velocidad y tiempo.
- `spike/protocol.mjs`, `qrsim.mjs` y `exp-protocol.mjs` de la rama `spike/WI-001-protocolo-transferencia-qr` — protocolo y escenarios de referencia, no para copiar.
- Proyecto base angular-base de este repositorio — para el prototipo PWA de medición.
- Librerías `qrcode` y `jsqr`, más al menos una alternativa de lectura — a comparar en IT-02.

## Referencias

- **Spike previo:** [WI-001](../WI-001-spike-protocolo-transferencia-qr/README.md); informe en la rama `spike/WI-001-protocolo-transferencia-qr`.
- **Requerimiento:** [raw-requirement.md](../../requirements/SRS-001-transferencia-qr/references/raw-requirement.md)
- **Diseño:** [WF-004](../../requirements/SRS-001-transferencia-qr/wireframes/WF-004-recibir-escaneo.md) (recepción; referencia de contenido, no se implementa).

## Enfoque del experimento

- [x] **IT-01** — Crear la rama `spike/WI-002-medicion-qr-android`, el prototipo PWA mínimo (emisor y receptor) y los archivos de prueba, desplegado de forma que los móviles lo carguen una vez.
- [x] **IT-02** — Portar el protocolo del WI-001 al prototipo; comparar `jsqr` con al menos otra librería de lectura y registrar APIs de cámara, almacenamiento, descarga y compartir disponibles.
- [x] **IT-03** — Medir la capacidad por QR (Q-01) con QR estáticos de 200 a 2000 B y niveles de corrección L y M; guardar los resultados en `assets/`.
- [ ] **IT-04** — Añadir la confirmación de nombre y tamaño antes de seguir (Q-06) y probarla con una secuencia ajena en cuadro, 10 intentos.
- [ ] **IT-05** — Medir velocidades de cambio, p por fotograma y tiempo de transferencia de 1 MB, 10 intentos con la mejor combinación (Q-02, Q-03); guardar la evidencia en `assets/`.
- [ ] **IT-06** — Con la app instalada y sin red, capturar el tráfico durante una transferencia completa (Q-05).
- [x] **IT-07** — Redactar `spike-report.md` con los resultados por `Q-XX`, el veredicto y los NFR de rendimiento y compatibilidad propuestos.

## Entregable

- `spike-report.md` en esta carpeta, con veredicto y marca oculta `spike:verdict`.
- Evidencia del experimento en `assets/` de esta carpeta.
- Rama `spike/WI-002-medicion-qr-android` con el código del experimento, sin integrar.

## Observaciones

- Las mediciones físicas (Q-01, Q-02, Q-03, Q-06) las ejecuta una persona con los dos móviles; el agente puede preparar el prototipo, el guion de pruebas y la hoja de registro, pero no puede escanear.
- El informe del WI-001 vive solo en su rama; conviene copiar sus hallazgos a `main` si se archiva el WI-001.
