# US-001: Enviar un archivo como secuencia de QR

<!-- us:status=Ready -->
**Estado:** Ready
**Fecha de creación:** 2026-10-08
**Última actualización:** 2026-10-08
**Repositorios:** laboratorio-1
**INVEST:** 🟢 5 · 🟡 1 / 6
**DoR:** 🟢 6 / 6
**Requerimiento:** [SRS-001: Transferencia de archivos mediante secuencia de QR](../../requirements/SRS-001-transferencia-qr/README.md)
**Spike de origen:** [WI-002: Medición con móviles Android de la transferencia por secuencia de QR](../../../archived/work-items/WI-002-spike-medicion-qr-android/README.md)

## Descripción

**COMO** persona que quiere pasar un archivo a otro dispositivo sin red
**QUIERO** elegir un archivo y mostrarlo como una secuencia de códigos QR en bucle
**PARA** que otro dispositivo lo reciba leyendo mi pantalla con su cámara

## Contexto

El emisor y el receptor son modos de una misma aplicación web instalable (PWA). El único canal es óptico (pantalla → cámara): el emisor no recibe información del receptor, por lo que no muestra progreso de transmisión. Esta historia incluye el protocolo de fragmentación (separado de la UI, con versión de formato) que la [US-002](../US-002-recibir-archivo-qr/README.md) consume. Los spikes [WI-001](../../../archived/work-items/WI-001-spike-protocolo-transferencia-qr/README.md) y [WI-002](../../../archived/work-items/WI-002-spike-medicion-qr-android/README.md) validaron el enfoque (viable con trabajo): fragmentos de 400 B con corrección M se leen con cámara real; el resto de lagunas se resuelve en las tareas.

## Fuera de alcance

- Transferir varios archivos en una misma transferencia.
- Cifrado, compresión, corrección de errores, tamaño de fragmento y velocidad configurables (diferidos, SRS-001 sección 2.6).
- Confirmaciones del receptor y reintentos selectivos.

## Reglas de negocio

- **BR-01:** Una transferencia DEBE incluir exactamente un archivo. → verificado por AC-002

## Criterios de aceptación

- **AC-001 (Interacción de usuario):** Al pulsar «Enviar», el sistema DEBE abrir el selector de archivos del dispositivo y permitir elegir un archivo de cualquier tipo; si el usuario cierra el selector sin elegir, el sistema NO DEBE iniciar ninguna transferencia.
  Casos de prueba: [TC-001](./test-cases/TC-001-enviar-abre-selector-happy.md) · [TC-002](./test-cases/TC-002-selector-cerrado-sin-elegir-error.md)
- **AC-002 (Reglas de negocio):** El sistema NO DEBE permitir elegir más de un archivo por transferencia.
  Casos de prueba: [TC-003](./test-cases/TC-003-no-permite-varios-archivos-error.md)
- **AC-003 (Salidas del sistema):** Al elegir el archivo, el sistema DEBE mostrar la secuencia de QR y, debajo, el nombre, tipo y tamaño del archivo, la cantidad total de QR y el tiempo estimado por vuelta, sin mostrar progreso de transmisión; el tiempo estimado DEBE mostrarse como «calculando…» mientras no haya datos suficientes.
  Casos de prueba: [TC-004](./test-cases/TC-004-muestra-qr-e-informacion-happy.md) · [TC-005](./test-cases/TC-005-tiempo-estimado-calculando-limite.md)
- **AC-004 (Procesamiento de datos):** El sistema DEBE dividir el archivo en fragmentos aptos para un QR, cada uno con identificador de transferencia, posición, número total de fragmentos, verificación de integridad propia y su contenido.
  Casos de prueba: [TC-006](./test-cases/TC-006-fragmentos-con-cabecera-completa-happy.md)
- **AC-005 (Procesamiento de datos):** El sistema DEBE transmitir el nombre y el tipo del archivo junto con su contenido para que el receptor los recupere.
  Casos de prueba: [TC-007](./test-cases/TC-007-metadatos-nombre-y-tipo-happy.md)
- **AC-006 (Casos de uso):** El sistema DEBE permitir transferir archivos de tamaño superior al que cabe en un único QR, usando múltiples QR.
  Casos de prueba: [TC-008](./test-cases/TC-008-archivo-mayor-que-un-qr-happy.md)
- **AC-007 (Salidas del sistema):** El emisor DEBE mostrar los QR de forma secuencial con una velocidad de cambio determinada automáticamente, sin intervención del usuario.
  Casos de prueba: [TC-009](./test-cases/TC-009-velocidad-automatica-sin-intervencion-happy.md)
- **AC-008 (Flujos de proceso):** El emisor DEBE repetir la secuencia de QR en bucle hasta que su usuario cancele.
  Casos de prueba: [TC-010](./test-cases/TC-010-bucle-continuo-tras-tres-vueltas-happy.md)
- **AC-009 (Casos de uso):** El usuario DEBE poder cancelar el envío en cualquier momento, sin confirmación; la cancelación DEBE detener la secuencia y liberar sus recursos, y la copia ya guardada del archivo (AC-010) DEBE conservarse.
  Casos de prueba: [TC-011](./test-cases/TC-011-cancelar-envio-sin-confirmacion-happy.md)
- **AC-010 (Procesamiento de datos):** Al iniciar el envío, el sistema DEBERÍA guardar una copia del archivo en el almacenamiento privado de la aplicación para que figure en el historial.
  Casos de prueba: [TC-012](./test-cases/TC-012-copia-en-historial-al-iniciar-happy.md)
- **AC-011 (Salidas del sistema):** El sistema DEBE mostrar un mensaje claro y NO DEBE iniciar la transferencia cuando el archivo esté vacío, no quepa en el almacenamiento disponible, la cuota se agote al guardar la copia o el navegador no sea compatible.
  Casos de prueba: [TC-013](./test-cases/TC-013-archivo-vacio-no-inicia-error.md) · [TC-014](./test-cases/TC-014-cuota-agotada-al-guardar-copia-error.md) · [TC-015](./test-cases/TC-015-navegador-incompatible-error.md)
- **AC-012 (Seguridad):** Durante el envío, el sistema NO DEBE enviar el contenido ni los metadatos del archivo fuera del dispositivo ni realizar peticiones de red de ningún tipo, incluida telemetría.
  Casos de prueba: [TC-016](./test-cases/TC-016-cero-peticiones-de-red-en-envio-happy.md)
- **AC-013 (Fiabilidad):** Tras la primera carga con red, el envío DEBE funcionar completamente sin conexión a Internet.
  Casos de prueba: [TC-017](./test-cases/TC-017-envio-sin-conexion-happy.md) · [TC-018](./test-cases/TC-018-envio-modo-avion-movil-happy.md)
- **AC-014 (Mantenibilidad):** El protocolo de fragmentación DEBE estar separado de la interfaz de usuario y del mecanismo de mostrar QR, y el formato DEBE incluir un número de versión.
  Casos de prueba: [TC-019](./test-cases/TC-019-protocolo-sin-interfaz-con-version-happy.md)
- **AC-015 (Usabilidad):** La pantalla de envío y sus estados de error DEBEN ser operables, sin desplazamiento horizontal, desde 360 px hasta 1280 px o más de ancho.
  Casos de prueba: [TC-020](./test-cases/TC-020-envio-operable-360-a-1280-limite.md)
- **AC-016 (Procesamiento de datos):** El sistema DEBE usar por defecto fragmentos de 400 B de datos por QR con nivel de corrección M; un tamaño mayor NO DEBE adoptarse por defecto sin una serie validada de 10 lecturas secuenciales a unos 30 cm con al menos 9 aciertos.
  Casos de prueba: [TC-021](./test-cases/TC-021-fragmento-por-defecto-400b-m-happy.md) · [TC-022](./test-cases/TC-022-serie-10-lecturas-para-tamano-mayor-limite.md)
- **AC-017 (Eficiencia de rendimiento):** El sistema DEBERÍA permitir transferir un archivo de 1 MB en 15 minutos o menos; este objetivo no está validado con cámara y se verifica con transferencias reales.
  Casos de prueba: [TC-023](./test-cases/TC-023-1mb-en-15-minutos-happy.md)
- **AC-018 (Salidas del sistema):** El sistema DEBE informar con un mensaje claro y NO DEBE iniciar la transferencia cuando el archivo requiera más fragmentos de los que admite el protocolo.
  Casos de prueba: [TC-024](./test-cases/TC-024-archivo-excede-maximo-de-fragmentos-limite.md)
- **AC-019 (Fiabilidad):** El fragmento de metadatos DEBE incluir el hash SHA-256 del archivo completo para que el receptor verifique la integridad.
  Casos de prueba: [TC-025](./test-cases/TC-025-metadatos-incluyen-sha256-happy.md)

## Referencias

- **Wireframe:** [WF-002: Enviar: QR e información del archivo](../../requirements/SRS-001-transferencia-qr/wireframes/WF-002-enviar-seleccion.md) — Aprobado ([SVG](../../requirements/SRS-001-transferencia-qr/wireframes/WF-002-enviar-seleccion.svg)); entrada «Enviar» en [WF-001](../../requirements/SRS-001-transferencia-qr/wireframes/WF-001-inicio-historial.md).
- **Requerimiento original:** [raw-requirement.md](../../requirements/SRS-001-transferencia-qr/references/raw-requirement.md)
- **Spike de origen:** [spike-report.md](../../../archived/work-items/WI-002-spike-medicion-qr-android/spike-report.md) (veredicto viable con trabajo; rama `spike/WI-002-medicion-qr-android` @ `22b1ef4`, referencia de lectura, nunca para mergear) y [WI-001](../../../archived/work-items/WI-001-spike-protocolo-transferencia-qr/spike-report.md) (no concluyente; rama `spike/WI-001-protocolo-transferencia-qr`).
- **Guion de medición:** `spike/GUIA-MEDICION.md` en la rama del spike, reutilizable para pruebas manuales de aceptación.

## Observaciones

- Spike completado: [WI-002](../../../archived/work-items/WI-002-spike-medicion-qr-android/spike-report.md) (⚠️ viable con trabajo) y [WI-001](../../../archived/work-items/WI-001-spike-protocolo-transferencia-qr/spike-report.md) (no concluyente). Sus hallazgos están consolidados en el informe del WI-002.
- Decisiones tomadas (2026-10-08): fragmento por defecto de 400 B con corrección M (validado: 10 de 10 lecturas); corrección de errores y códigos de fuente (fountain) **diferidos** (fuera de alcance, como en el SRS-001).
- Riesgo asumido: con fragmentos de 400 B y el bucle secuencial, 1 MB en 15 minutos (AC-017) no se alcanza a 5 fps según el modelo (36,9 min con 90 % de lectura por vuelta); exige más de 8 fps o un tamaño de fragmento mayor validado. Por eso AC-017 es DEBERÍA y se verifica con transferencias reales.
- Lagunas que **se resuelven en las tareas** (no bloquean la historia; cada una con criterio verificable y su decisión en el `progress.md` de la tarea): regla de velocidad automática, funcionamiento sin red con la app instalada, límite de fragmentos (AC-018) y estrategia de actualización del service worker. Detalle en la tabla «Lagunas abiertas» del [informe](../../../archived/work-items/WI-002-spike-medicion-qr-android/spike-report.md).
- Los NFR de rendimiento y compatibilidad propuestos por el spike se incorporan al SRS-001 con `/requirement-refine` (este skill no edita el SRS).
- Cobertura del SRS: FR-001 a FR-006, FR-014 (emisor), FR-017, FR-018, FR-022 (emisor), NFR-001, NFR-002, NFR-005, NFR-006 y BR-01.

---

## Validación

### Complejidad sugerida

- **Story points:** 8
- **Justificación:** Incluye el protocolo de fragmentación y la visualización en bucle. El spike redujo la incertidumbre técnica (lectura de 400 B validada); el riesgo restante es el tiempo de 1 MB y la regla de velocidad.

### INVEST

| Letra | Criterio      | Resultado | Notas |
| ----- | ------------- | --------- | ----- |
| **I** | Independiente | Cumple    | El spike se completó; es prerrequisito de la US-002. |
| **N** | Negociable    | Cumple    | Velocidad y tamaño mayor de fragmento negociables con validación. |
| **V** | Valiosa       | Cumple    | Permite iniciar una transferencia sin red. |
| **E** | Estimable     | Cumple    | Con los resultados del spike se puede estimar. |
| **S** | Pequeña       | Parcial   | 19 criterios; valorar dividir (protocolo / emisión) al planificar tareas. |
| **T** | Testeable     | Cumple    | Cada criterio es verificable; AC-017 con transferencias reales. |

### Definition of Ready (DoR)

| Criterio DoR                       | Estado    | Notas |
| ---------------------------------- | --------- | ----- |
| Dependencias listas                | Cumple    | Spikes completados. |
| Inputs/outputs claros              | Cumple    | Archivo de entrada; secuencia de QR e información de salida. |
| Repositorios definidos             | Cumple    | laboratorio-1. |
| Sin decisiones técnicas pendientes | Cumple    | Fragmento y corrección de errores decididos; el resto se resuelve en las tareas. |
| Referencias de UI                  | Cumple    | WF-002 aprobado. |
| Sin aclaraciones pendientes        | Cumple    | Sin preguntas abiertas a producto; lagunas técnicas delegadas a las tareas. |
