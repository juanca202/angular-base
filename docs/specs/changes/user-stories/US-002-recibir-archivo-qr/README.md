# US-002: Recibir un archivo escaneando una secuencia de QR

<!-- us:status=Ready -->
**Estado:** Ready
**Fecha de creación:** 2026-10-08
**Última actualización:** 2026-10-09
**Repositorios:** laboratorio-1
**INVEST:** 🟢 4 · 🟡 2 / 6
**DoR:** 🟢 6 / 6
**Requerimiento:** [SRS-001: Transferencia de archivos mediante secuencia de QR](../../requirements/SRS-001-transferencia-qr/README.md)
**Spike de origen:** [WI-002: Medición con móviles Android de la transferencia por secuencia de QR](../../../archived/work-items/WI-002-spike-medicion-qr-android/README.md)

## Descripción

**COMO** persona que quiere recibir un archivo desde otro dispositivo sin red
**QUIERO** apuntar la cámara a la secuencia de QR del emisor y obtener el archivo reconstruido y verificado
**PARA** tener una copia idéntica del archivo guardada en mi dispositivo

## Contexto

Consume el protocolo definido en la [US-001](../US-001-enviar-archivo-qr/README.md). La lectura es continua (sin fotos manuales) y tolera duplicados, desorden y lecturas corruptas. Los fragmentos parciales viven solo en memoria mientras la pantalla de recepción está abierta. El texto exacto de los mensajes de error se define en la implementación. El spike [WI-002](../../../archived/work-items/WI-002-spike-medicion-qr-android/README.md) (viable con trabajo) validó la lectura con cámara real en Chrome para Android con `jsQR` y `BarcodeDetector`; desde el 2026-10-09 la lectura se hace **solo con `zxing-wasm`** (ver AC-022).

## Fuera de alcance

- Reintentos selectivos o confirmaciones hacia el emisor (no hay canal de retorno).
- Persistir fragmentos parciales entre sesiones.
- Elegir carpetas del sistema para guardar (se usa el almacenamiento privado de la app).

## Reglas de negocio

- **BR-02:** Una transferencia DEBE considerarse completada solo si la verificación de integridad es satisfactoria. → verificado por AC-006, AC-007
- **BR-03:** Si la verificación falla o faltan fragmentos, el sistema NO DEBE guardar el archivo recibido ni registrarlo en el historial. → verificado por AC-018

## Criterios de aceptación

- **AC-001 (Interacción de usuario):** Al pulsar «Recibir», el sistema DEBE activar la cámara y leer automáticamente los QR sin que el usuario tome fotografías individuales.
  Casos de prueba: [TC-001](test-cases/TC-001-recibir-lee-qr-sin-fotos-happy.md)
- **AC-002 (Procesamiento de datos):** El receptor DEBE descartar los fragmentos que pertenezcan a otra transferencia o que estén corruptos o inválidos.
  Casos de prueba: [TC-002](test-cases/TC-002-descarta-fragmentos-corruptos-error.md) · [TC-003](test-cases/TC-003-descarta-fragmentos-de-otra-transferencia-error.md)
- **AC-003 (Procesamiento de datos):** El receptor DEBE aceptar los fragmentos en cualquier orden y reordenarlos según su posición.
  Casos de prueba: [TC-004](test-cases/TC-004-acepta-fragmentos-en-desorden-happy.md)
- **AC-004 (Procesamiento de datos):** El receptor DEBE ignorar los fragmentos ya recibidos, sin alterar el resultado.
  Casos de prueba: [TC-005](test-cases/TC-005-ignora-fragmentos-repetidos-limite.md)
- **AC-005 (Salidas del sistema):** Durante la recepción, el sistema DEBE mostrar el nombre y tamaño total del archivo, el tiempo estimado restante, los fragmentos recibidos del total y una barra de progreso con el porcentaje recibido; en móvil DEBE mostrar al menos nombre, tamaño, tiempo y porcentaje.
  Casos de prueba: [TC-006](test-cases/TC-006-progreso-con-nombre-tamano-tiempo-happy.md) · [TC-007](test-cases/TC-007-progreso-minimo-en-movil-limite.md)
- **AC-006 (Procesamiento de datos):** Al tener todos los fragmentos, el receptor DEBE reconstruir el archivo y verificar su integridad automáticamente, sin acción del usuario, y liberar la cámara; solo entonces DEBE considerar la transferencia completada.
  Casos de prueba: [TC-008](test-cases/TC-008-reconstruye-verifica-y-libera-camara-happy.md)
- **AC-007 (Salidas del sistema):** El receptor DEBE informar el resultado: «completada» (todos los fragmentos y verificación satisfactoria); «incompleta» (el usuario pulsa «Terminar lectura» y faltan fragmentos); «datos inválidos» (todos los fragmentos pero falla la verificación); «no reconstruible» (no se puede ensamblar, p. ej. metadatos inconsistentes).
  Casos de prueba: [TC-009](test-cases/TC-009-resultado-completada-happy.md) · [TC-010](test-cases/TC-010-resultado-incompleta-error.md) · [TC-011](test-cases/TC-011-resultado-datos-invalidos-error.md) · [TC-012](test-cases/TC-012-resultado-no-reconstruible-error.md)
- **AC-008 (Casos de uso):** El usuario DEBE poder cancelar la recepción en cualquier momento, sin confirmación; la cancelación DEBE detener el proceso, descartar los datos parciales y liberar la cámara.
  Casos de prueba: [TC-013](test-cases/TC-013-cancelar-recepcion-libera-camara-happy.md)
- **AC-009 (Procesamiento de datos):** Al completarse la recepción, el sistema DEBE guardar el archivo con su nombre y tipo originales en el almacenamiento privado de la aplicación, sin solicitar permisos de carpeta, y NO DEBE sobrescribir un archivo existente con el mismo nombre.
  Casos de prueba: [TC-014](test-cases/TC-014-guarda-con-nombre-y-tipo-originales-happy.md) · [TC-015](test-cases/TC-015-mismo-nombre-no-sobrescribe-limite.md)
- **AC-010 (Interacción de usuario):** Al completarse la recepción, el sistema DEBE mostrar una previsualización (la imagen si lo es; en otro caso, un icono con el nombre) con el historial directamente debajo, y DEBE abrir el archivo al hacer clic en ella (mostrándolo si el tipo es visualizable y, si no, descargándolo).
  Casos de prueba: [TC-016](test-cases/TC-016-previsualiza-imagen-y-abre-happy.md) · [TC-017](test-cases/TC-017-previsualiza-otro-tipo-con-icono-happy.md)
- **AC-011 (Flujos de proceso):** Tras «incompleta», el receptor DEBE permitir seguir escaneando conservando los fragmentos válidos ya recibidos; tras «datos inválidos» o «no reconstruible» DEBE permitir reintentar desde cero. Los fragmentos parciales NO DEBEN persistirse.
  Casos de prueba: [TC-018](test-cases/TC-018-seguir-escaneando-tras-incompleta-happy.md) · [TC-019](test-cases/TC-019-reintentar-desde-cero-tras-error-error.md)
- **AC-012 (Salidas del sistema):** El sistema DEBE mostrar un mensaje claro y NO DEBE iniciar la recepción cuando no haya cámara o permiso para usarla o el navegador no sea compatible, y DEBE avisar si la cuota de almacenamiento se agota al guardar.
  Casos de prueba: [TC-020](test-cases/TC-020-sin-camara-o-permiso-denegado-error.md) · [TC-021](test-cases/TC-021-navegador-incompatible-recibir-error.md) · [TC-022](test-cases/TC-022-cuota-agotada-al-guardar-recepcion-error.md)
- **AC-013 (Fiabilidad):** El archivo recibido DEBE ser idéntico byte a byte al original, comprobado con una verificación de integridad.
  Casos de prueba: [TC-023](test-cases/TC-023-archivo-identico-byte-a-byte-happy.md)
- **AC-014 (Seguridad):** La previsualización y apertura del archivo recibido NO DEBEN ejecutar contenido activo (p. ej. scripts incrustados en SVG o HTML).
  Casos de prueba: [TC-024](test-cases/TC-024-svg-con-script-no-se-ejecuta-error.md)
- **AC-015 (Seguridad):** Durante la recepción, el sistema NO DEBE enviar contenido ni metadatos fuera del dispositivo ni realizar peticiones de red de ningún tipo, incluida telemetría.
  Casos de prueba: [TC-025](test-cases/TC-025-cero-peticiones-de-red-en-recepcion-happy.md)
- **AC-016 (Fiabilidad):** Tras la primera carga con red, la recepción DEBE funcionar completamente sin conexión a Internet.
  Casos de prueba: [TC-026](test-cases/TC-026-recepcion-modo-avion-movil-happy.md)
- **AC-017 (Usabilidad):** Las pantallas de recepción y resultado, incluidos sus estados de error, DEBEN ser operables sin desplazamiento horizontal desde 360 px hasta 1280 px o más de ancho.
  Casos de prueba: [TC-027](test-cases/TC-027-recibir-operable-360-a-1280-limite.md)
- **AC-018 (Reglas de negocio):** Tras un resultado «incompleta», «datos inválidos» o «no reconstruible», el sistema NO DEBE guardar el archivo ni registrarlo en el historial.
  Casos de prueba: [TC-028](test-cases/TC-028-error-no-guarda-ni-registra-error.md)
- **AC-019 (Interacción de usuario):** Tras leer el fragmento de metadatos de una transferencia, el receptor DEBE mostrar su nombre y tamaño y pedir confirmación antes de darla por activa; hasta confirmar, NO DEBE completar ni guardar ningún archivo, y al descartarla DEBE ignorar sus fragmentos.
  Casos de prueba: [TC-029](test-cases/TC-029-no-activa-hasta-confirmar-nombre-y-tamano-happy.md) · [TC-030](test-cases/TC-030-descartar-transferencia-ignora-sus-fragmentos-error.md) · [TC-031](test-cases/TC-031-secuencia-ajena-en-cuadro-movil-error.md)
- **AC-020 (Salidas del sistema):** Mientras espera la confirmación, el receptor DEBE mostrar los fragmentos ya leídos, y el aviso de confirmación DEBE permanecer visible.
  Casos de prueba: [TC-032](test-cases/TC-032-avance-y-aviso-visibles-antes-de-confirmar-happy.md)
- **AC-021 (Usabilidad):** El receptor NO DEBE iniciar una lectura nueva mientras otra está en curso.
  Casos de prueba: [TC-033](test-cases/TC-033-no-inicia-lectura-mientras-hay-otra-error.md)
- **AC-022 (Compatibilidad):** El receptor DEBE funcionar en Chrome para Android (probado en Chrome 154 sobre Android 10); DEBE leer los QR siempre con `zxing-wasm`, sin depender de `BarcodeDetector` ni de `jsQR` ni de ningún servicio del dispositivo.
  Casos de prueba: [TC-034](test-cases/TC-034-funciona-en-chrome-android-happy.md) · [TC-035](test-cases/TC-035-lectura-con-zxing-sin-barcodedetector-error.md)
- **AC-023 (Eficiencia de rendimiento):** El receptor DEBE leer un QR de 400 B con corrección M a unos 30 cm en al menos 9 de 10 intentos secuenciales.
  Casos de prueba: [TC-036](test-cases/TC-036-lectura-400b-m-30cm-9-de-10-happy.md)
- **AC-024 (Eficiencia de rendimiento):** El receptor DEBERÍA completar una transferencia de 1 MB en 15 minutos o menos; este objetivo no está validado con cámara y se verifica con transferencias reales.
  Casos de prueba: [TC-037](test-cases/TC-037-recepcion-1mb-en-15-minutos-happy.md)
- **AC-025 (Fiabilidad):** El sistema DEBERÍA solicitar almacenamiento persistente al guardar un archivo recibido para reducir el riesgo de que el navegador lo borre.
  Casos de prueba: [TC-038](test-cases/TC-038-solicita-almacenamiento-persistente-happy.md)
- **AC-026 (Salidas del sistema):** Sobre la imagen de la cámara, el receptor DEBE dibujar un recuadro alrededor del QR solo mientras lo detecta, alineado con su posición en la imagen mostrada, sin ningún recuadro fijo cuando no hay QR; ante un cuadro en el que no se lee el QR, el recuadro DEBERÍA mantenerse unos 0,4 s y DEBE desaparecer al detener la lectura (SRS-001 FR-036).
  Casos de prueba: [TC-039](test-cases/TC-039-recuadro-solo-sobre-el-qr-detectado-happy.md) · [TC-040](test-cases/TC-040-recuadro-se-mantiene-un-momento-y-se-borra-limite.md)
- **AC-027 (Fiabilidad):** El lector de QR (módulo WebAssembly de `zxing-wasm`) DEBE servirse con la aplicación y quedar precacheado por el service worker, de modo que la recepción funcione sin conexión y sin peticiones de red, y DEBE cargarse al empezar la recepción, antes del primer cuadro (SRS-001 NFR-013).
  Casos de prueba: [TC-041](test-cases/TC-041-lector-wasm-sin-conexion-happy.md)

## Referencias

- **Wireframe:** [WF-004: Recibir: escaneo e información](../../requirements/SRS-001-transferencia-qr/wireframes/WF-004-recibir-escaneo.md) — Aprobado ([SVG](../../requirements/SRS-001-transferencia-qr/wireframes/WF-004-recibir-escaneo.svg))
- **Wireframe:** [WF-005: Resultado y previsualización](../../requirements/SRS-001-transferencia-qr/wireframes/WF-005-resultado-recepcion.md) — Aprobado ([SVG](../../requirements/SRS-001-transferencia-qr/wireframes/WF-005-resultado-recepcion.svg)); incluye variantes de error
- **Requerimiento original:** [SRS-001](../../requirements/SRS-001-transferencia-qr/README.md)
- **Spike de origen:** [spike-report.md](../../requirements/SRS-001-transferencia-qr/references/spike-report-WI-002-medicion-qr-android.md) (veredicto viable con trabajo; rama `spike/WI-002-medicion-qr-android` @ `22b1ef4`, referencia de lectura, nunca para mergear) y [WI-001](../../requirements/SRS-001-transferencia-qr/references/spike-report-WI-001-protocolo-transferencia-qr.md) (no concluyente; rama `spike/WI-001-protocolo-transferencia-qr`).
- **Guion de medición:** `spike/GUIA-MEDICION.md` en la rama del spike, reutilizable para pruebas manuales de aceptación.

## Observaciones

- Spike completado: [WI-002](../../requirements/SRS-001-transferencia-qr/references/spike-report-WI-002-medicion-qr-android.md) (⚠️ viable con trabajo) y [WI-001](../../requirements/SRS-001-transferencia-qr/references/spike-report-WI-001-protocolo-transferencia-qr.md) (no concluyente). Sus hallazgos están consolidados en el informe del WI-002.
- Decisiones tomadas (2026-10-08): fragmento por defecto de 400 B con corrección M; corrección de errores y códigos de fuente (fountain) **diferidos**; elección de transferencia con confirmación de nombre y tamaño (H-01, AC-019).
- Riesgo asumido: 1 MB en 15 minutos (AC-024) depende del tamaño de fragmento y de la velocidad del emisor ([US-001](../US-001-enviar-archivo-qr/README.md), AC-017); por eso es DEBERÍA y se verifica con transferencias reales.
- Lagunas que **se resuelven en las tareas** (no bloquean la historia; cada una con criterio verificable y su decisión en el `progress.md` de la tarea): funcionamiento sin red con la app instalada, compatibilidad con iOS y Firefox, estrategia de actualización del service worker y persistencia del almacenamiento. Detalle en la tabla «Lagunas abiertas» del [informe](../../requirements/SRS-001-transferencia-qr/references/spike-report-WI-002-medicion-qr-android.md).
- Decisiones del 2026-10-09 ([SRS-001](../../requirements/SRS-001-transferencia-qr/README.md)): la lectura de QR se hace **solo con `zxing-wasm`** (`BarcodeDetector` y `jsQR` descartados; `BarcodeDetector` falla siempre en el móvil de pruebas), el receptor lee **un QR por cuadro** (FR-035 retirado), se dibuja un recuadro sobre el QR detectado (AC-026) y el lector funciona sin conexión (AC-027). Los criterios AC-019 y AC-020 (confirmar nombre y tamaño) quedan pendientes de revisar: el SRS-001 los dejó sin confirmación el 2026-10-08 (FR-023).
- Los NFR de rendimiento y compatibilidad propuestos por el spike se incorporan al SRS-001 con `/requirement-refine` (este skill no edita el SRS).
- Cobertura del SRS: FR-007 a FR-015, FR-020, FR-021, FR-022 (recepción), FR-014 (receptor), FR-036, NFR-001 a NFR-003, NFR-006, NFR-007, NFR-012, NFR-013, BR-02, BR-03.

---

## Validación

### Complejidad sugerida

- **Story points:** 13
- **Justificación:** Lectura continua con cámara, reensamblado tolerante a fallos, verificación de integridad, cuatro resultados, confirmación de transferencia y previsualización segura. El spike redujo la incertidumbre de cámara; la historia es candidata a dividirse al planificar tareas.

### INVEST

| Letra | Criterio      | Resultado | Notas |
| ----- | ------------- | --------- | ----- |
| **I** | Independiente | Cumple    | Depende de la [US-001](../US-001-enviar-archivo-qr/README.md) (protocolo), ya definida; el spike se completó. |
| **N** | Negociable    | Cumple    | Mensajes y presentación concretos quedan a la implementación. |
| **V** | Valiosa       | Cumple    | Cierra el ciclo de transferencia. |
| **E** | Estimable     | Cumple    | Con los resultados del spike se puede estimar. |
| **S** | Pequeña       | Parcial   | 25 criterios; dividir (recepción / resultado y previsualización) al planificar tareas. |
| **T** | Testeable     | Parcial   | Los resultados son provocables; AC-024 y el modo sin red se verifican con transferencias reales. |

### Definition of Ready (DoR)

| Criterio DoR                       | Estado    | Notas |
| ---------------------------------- | --------- | ----- |
| Dependencias listas                | Cumple    | US-001 definida y spikes completados. |
| Inputs/outputs claros              | Cumple    | Secuencia de QR de entrada; archivo guardado y resultado de salida. |
| Repositorios definidos             | Cumple    | laboratorio-1. |
| Sin decisiones técnicas pendientes | Cumple    | Fragmento, corrección de errores y política de elección decididos; el resto se resuelve en las tareas. |
| Referencias de UI                  | Cumple    | WF-004 y WF-005 aprobados. |
| Sin aclaraciones pendientes        | Cumple    | Sin preguntas abiertas a producto; lagunas técnicas delegadas a las tareas. |
