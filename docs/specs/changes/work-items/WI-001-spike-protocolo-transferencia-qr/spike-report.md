# Informe del spike WI-001: Viabilidad del protocolo de transferencia por secuencia de QR

<!-- spike:verdict=INCONCLUSIVE · timebox=2d/<1d · branch=spike/WI-001-protocolo-transferencia-qr · head=be67801 · generated=2026-10-08 -->
**Spike:** [WI-001: Viabilidad del protocolo de transferencia por secuencia de QR](README.md)
**Veredicto:** ⏸️ No concluyente
**Subtipo:** técnico
**Timebox:** 2 días · consumido: menos de 1 día
**Rama de referencia:** `spike/WI-001-protocolo-transferencia-qr` @ `be67801` — no integrar
**Fecha:** 2026-10-08
**Autor:** juanca202 / Claude

## Resumen ejecutivo

El protocolo propuesto (fragmentos versionados con CRC32, metadatos en el fragmento 0 y SHA-256 del archivo) reconstruye archivos de 1 MB sin errores con desorden, duplicados, pérdidas y fragmentos corruptos, y distingue los cuatro resultados de FR-013. Lo que decide la viabilidad real —capacidad estable por QR, velocidad de cambio, APIs de Chrome Android y PWA sin red— **no se pudo medir** porque no había cámara ni móviles, por decisión del usuario de cerrar «solo con lo automatizable». El veredicto es **no concluyente**. Recomendación: un segundo spike acotado, con móviles reales, sobre Q-01, Q-02, Q-05 y Q-06, antes de pasar US-001 y US-002 a Ready. Además hay un hallazgo de diseño (H-01) que hay que decidir antes de implementar.

## Qué se probó

Prototipo en Node en `spike/` (rama del spike): `protocol.mjs` (fragmentación y receptor, sin dependencias de UI), `qrsim.mjs` (QR con `qrcode`, degradación sintética y lectura con `jsqr`) y dos scripts de experimento. Los QR se generan y leen de verdad, pero la «cámara» es una simulación (desenfoque, ruido gaussiano por píxel y menor contraste sobre la imagen renderizada).

| `IT-XX` | Planificado | Ejecutado | Desviación |
|---------|-------------|-----------|------------|
| IT-01 | Proyecto desde angular-base y dispositivos | Carpeta `spike/` en Node con archivos aleatorios de 20 KB a 1 MB | No se usó angular-base ni dispositivos |
| IT-02 | Comparar librerías en Chrome Android | Solo `qrcode` + `jsqr` en Node; no se comparó ninguna alternativa | **No ejecutado como estaba planeado**: sin Chrome Android ni segunda librería |
| IT-03 | Emisor y receptor mínimos con protocolo versionado | Hecho, sin UI | Ninguna |
| IT-04 | Capacidad, velocidad, desorden, duplicados y corruptos | Capacidad en simulación; modelo de tiempo; integridad con 1 MB | Sin cámara real; la velocidad es un modelo, no una medición |
| IT-05 | Offline, tráfico de red y APIs de Chrome Android | **No ejecutado** | Sin navegador ni dispositivo |
| IT-06 | Informe | Este documento | Ninguna |

## Resultados por pregunta

| `Q-XX` | Criterio de éxito | Resultado observado | Resultado | Evidencia |
|--------|-------------------|---------------------|-----------|-----------|
| Q-01 | Capacidad por QR leída sin errores en el 100 % de las pruebas de ajuste | Sin degradación, 200 a 2200 B (versiones 9 a 39) se leen al 100 % desde 4 px por módulo. Con degradación simulada suave y 6 px por módulo: 800 B → 100 % (L) y 88 % (M); 1200 B → 88 % (L) y 63 % (M); 1800 B o más → 0 %. No hay capacidad con 100 % bajo degradación, pero la simulación no es una cámara | ⏸️ No concluyente | [EV-01](assets/EV-01-capacidad-por-qr.json) |
| Q-02 | 1 MB en ≤ 15 min con hash idéntico en ≥ 9 de 10 intentos reales | No hay intentos reales. Modelo (fragmentos de 800 B, 1312 fragmentos): con 90 % de lectura por vuelta, 10,6 min a 8 fps y 16,7 min a 5 fps; con 70 %, 19,2 min a 8 fps. Con fragmentos de 1200 B y 90 %: 6,5 min a 8 fps | ⏸️ No concluyente | [EV-02](assets/EV-02-protocolo-y-modelo.json) |
| Q-03 | Hash idéntico en el 100 % de las transferencias completadas | 10 transferencias de 1 MB con 30 % de pérdida, 5 % de fragmentos corruptos, duplicados y 20 fragmentos ajenos por vuelta: 9 idénticas. **La 10.ª terminó «completada» con el archivo equivocado** (H-01). Resultados de error correctos: `incomplete`, `invalid`, `unreconstructable` y `completed` | ❌ No cumple, por H-01 | [EV-02](assets/EV-02-protocolo-y-modelo.json) |
| Q-04 | Fórmula documentada con error reportado | Vueltas esperadas ≈ ln(N) / −ln(1−p) + 0,5; error medio −6 % frente a la simulación (rango −2 % a −12 %). El error frente al tiempo real no se midió, y depende de p, que solo se obtiene con cámara | ⏸️ No concluyente | [EV-02](assets/EV-02-protocolo-y-modelo.json) |
| Q-05 | Una combinación de librerías que cumpla Q-01 a Q-03 en Chrome Android | `qrcode` genera y `jsqr` lee carga binaria correctamente en Node (decodificación de 2 ms a 61 ms por fotograma según tamaño). No se probó en Chrome Android ni se evaluaron APIs de cámara, almacenamiento, descarga o compartir | ⏸️ No concluyente | [EV-01](assets/EV-01-capacidad-por-qr.json) |
| Q-06 | Cero peticiones de red con la app instalada y sin red | No evaluado: sin navegador ni dispositivo | ⏸️ No concluyente | — |

## Hallazgos

### H-01: el receptor puede quedarse con la transferencia equivocada

El receptor fija la transferencia con el **primer fragmento válido** que ve y descarta el resto como ajenos (FR-008). Si lo primero que lee es un QR de otra secuencia (otra pantalla en cuadro, una vuelta anterior de otro envío), completa y verifica **ese** archivo contra sus propios metadatos: el resultado dice «completada» y el hash es consistente, pero no es el archivo que el usuario quería. El SRS no dice qué hacer si se ven dos transferencias a la vez.

### Supuestos de la simulación

- El ruido gaussiano independiente por píxel penaliza a `jsqr` más cuando los módulos son grandes: con 8 o 10 px por módulo y ruido las lecturas bajaron a casi 0 %, algo que una cámara real no suele producir. Por eso la simulación sirve para comparar protocolos, **no** para fijar capacidades ni velocidades.
- Sin degradación, el límite práctico es el de la especificación del QR en modo binario: 2953 B (L) y 2331 B (M); 2400 B ya no cabe en M.

### Coste del protocolo

Cada fragmento suma 15 B de cabecera y CRC (3,6 % con 400 B, 1,9 % con 800 B). El fragmento de metadatos añade un QR más.

## Diagnóstico

Lo que funcionó: la fragmentación, el reensamblado tolerante a desorden, duplicados, pérdidas y corrupción, la verificación SHA-256 y los cuatro resultados de FR-013. Lo que impide concluir: no hay cámara real, así que no se conoce la probabilidad de lectura por fotograma (p), que es la variable que decide capacidad, velocidad y tiempo. Limitación del prototipo: todo corre en Node. Limitación del enfoque que la implementación heredaría: H-01.

## Consideraciones para la implementación definitiva

No obligatoria con este veredicto; se dejan como punto de partida para el segundo spike y para ajustar las historias.

1. **Decisiones que hay que tomar antes de implementar:** cómo el receptor elige entre varias transferencias visibles (H-01). Opciones: fijar la primera que complete su fragmento de metadatos y mostrar nombre y tamaño para que el usuario cancele si no es la suya; o exigir confirmación del nombre antes de seguir. Esto afecta a FR-008 y al wireframe WF-004.
2. **Deuda del prototipo que NO debe heredarse:** formato binario sin plan de migración más allá del byte de versión, sin límite de 65 535 fragmentos validado (con 800 B equivale a unos 52 MB), ruido sintético como sustituto de la cámara.
3. **Riesgos detectados:** el objetivo de 1 MB en 15 min (Q-02) exige lectura fiable de fragmentos grandes a ≥ 6 fps; si la cámara real da p ≈ 0,7, no se cumple. Mitigación: valorar bajar el umbral o usar fragmentos más grandes con corrección de errores (hoy fuera de alcance).
4. **Dependencias confirmadas:** `qrcode` (generación) y `jsqr` (lectura) funcionan con carga binaria; falta validar en navegador.
5. **Estimación orientativa:** sin cambios respecto a US-001 (8) y US-002 (13); la incertidumbre de cámara sigue abierta.

## Qué reutilizar de la rama

- `spike/protocol.mjs` — formato de fragmento, receptor y las cuatro salidas de resultado; como referencia de lectura, no para copiar.
- `spike/exp-protocol.mjs` — escenarios de desorden, duplicados, corrupción y fragmentos ajenos, útiles como casos de prueba.

## Impacto en el artefacto / próximo paso

- Segundo spike más acotado (`/work-plan`, `Resolución: Re-espigado`), con móviles Android reales, sobre Q-01, Q-02, Q-05 y Q-06, y con el criterio de H-01 decidido.
- Hasta entonces, [US-001](../../user-stories/US-001-enviar-archivo-qr/README.md) y [US-002](../../user-stories/US-002-recibir-archivo-qr/README.md) siguen en Draft.
- Registrar la regla de elección de transferencia (H-01) como criterio nuevo de la [US-002](../../user-stories/US-002-recibir-archivo-qr/README.md) con `/work-define`.

## Fuentes

- [qrcode (npm)](https://www.npmjs.com/package/qrcode) y [jsQR (npm)](https://www.npmjs.com/package/jsqr) — librerías usadas en el prototipo.
