# SRS-001: Transferencia de archivos mediante secuencia de QR

<!-- srs:status=Ready -->
**Estado:** Ready
**Fecha de creación:** 2026-10-08
**Última actualización:** 2026-10-09

## 1. Introducción

### 1.1 Propósito

Permitir que una persona pase un archivo de un dispositivo a otro usando solo la pantalla de uno y la cámara del otro, mediante una secuencia de códigos QR, en entornos sin red o sin conectividad disponible. Lo usan tanto una persona que transfiere entre sus propios dispositivos como dos personas cara a cara.

### 1.2 Alcance del producto

Aplicación web responsiva e instalable (PWA) que, en un mismo dispositivo, puede actuar como **emisor** (muestra la secuencia de QR de un archivo) o como **receptor** (la lee con la cámara, reconstruye el archivo y verifica su integridad). Guarda en un historial local los archivos enviados y recibidos, y permite exportarlos y eliminarlos.

**Fuera de alcance (esta versión):**

- Cifrado de los datos transmitidos o almacenados, corrección de errores del protocolo, QR dinámicos, confirmaciones bidireccionales, reintentos selectivos: quedan fuera de esta versión.
- Transferir varios archivos en una misma transferencia.
- Reintentos selectivos con confirmación entre dispositivos (RF-07 del requerimiento original): en esta versión la recuperación ante pérdida se resuelve con el bucle del emisor (FR-006) y la posibilidad de seguir escaneando (FR-021). El criterio AC-05 del requerimiento original («cuando termina la secuencia, detectar que está incompleta») se cumple cuando el usuario termina la lectura con faltantes (FR-013).
- Cuentas de usuario, servidores, Bluetooth, Wi-Fi Direct o cualquier canal distinto de cámara y pantalla.
- Guardar archivos en carpetas del sistema elegidas por el usuario (se decidió el almacenamiento privado de la aplicación con exportación manual).
- Garantía de funcionamiento en Safari (iOS incluido), Firefox u otros navegadores distintos de Chrome en Android (ver NFR-008).

### 1.3 Definiciones, acrónimos y abreviaturas

- **Emisor:** dispositivo que muestra la secuencia de QR.
- **Receptor:** dispositivo que lee la secuencia con la cámara.
- **Fragmento:** porción del archivo (con sus metadatos) codificada en un QR.
- **Vuelta:** una pasada completa de la secuencia de QR; el emisor la repite en bucle.
- **Almacenamiento privado de la app:** espacio de almacenamiento del navegador accesible solo para la aplicación.
- **PWA:** aplicación web instalable que funciona sin conexión tras su primera carga.

### 1.4 Referencias

- Proyecto base: [angular-base](https://github.com/juanca202/angular-base).
- Spikes que respaldan las decisiones (referencias de experimentos, no requisitos):

| Spike | Veredicto | Decisiones que respalda |
| ----- | --------- | ----------------------- |
| [WI-001](references/spike-report-WI-001-protocolo-transferencia-qr.md): protocolo de transferencia | Viable con trabajo | Protocolo verificado en el spike (2.6): fragmentación con primeros datos en el fragmento de metadatos, CRC32 y SHA-256, bucle, compresión, límite de 65 535 fragmentos y activación de la primera transferencia (FR-003, FR-004, FR-006, FR-008 a FR-010, FR-023, FR-024, FR-030, NFR-005); hallazgo H-01 (transferencia ajena) resuelto con FR-023 |
| [WI-002](references/spike-report-WI-002-medicion-qr-android.md): medición con Android | Viable con trabajo | Fragmento de 400 B validado con corrección M (NFR-009), Chrome en Android (NFR-008), 1 MB en 15 min como objetivo (NFR-010), límite de fragmentos (FR-024), almacenamiento persistente (FR-025), actualización del service worker (NFR-011) |
| [WI-003](references/spike-report-WI-003-lectura-qr-android.md): lectura de QR en Android | Viable con trabajo | Lectura solo con `zxing-wasm`; `BarcodeDetector` y `jsQR` descartados (NFR-008, NFR-012, NFR-013, R-11) |
| [WI-004](references/spike-report-WI-004-dos-qr-a-la-vez.md): dos QR a la vez | No viable | descartado: un QR en pantalla y uno por cuadro |

## 2. Descripción general del producto

### 2.1 Perspectiva del producto

Producto nuevo e independiente. No se integra con otros sistemas ni requiere servidor: el único canal entre los dos dispositivos es óptico (pantalla del emisor → cámara del receptor). Parte del proyecto base angular-base.

### 2.2 Funciones del producto

- Elegir un archivo y emitirlo como secuencia de QR en bucle, mostrando su información y tiempo estimado.
- Recibir con la cámara, sin fotos manuales, tolerando duplicados, desorden y lecturas corruptas.
- Mostrar progreso de recepción, verificar integridad y guardar el archivo.
- Previsualizar el archivo recibido y abrirlo.
- Mantener un historial de enviados y recibidos con filtros, exportación y eliminación.

**Flujo principal**

```text
EMISOR                              RECEPTOR

Seleccionar datos
       │
       ▼
Preparar datos
       │
       ▼
Comprimir / procesar
       │
       ▼
Dividir en fragmentos
       │
       ▼
Generar QR
       │
       │       QR 1
       │ ───────────────────────► Escanear
       │       QR 2
       │ ───────────────────────► Escanear
       │       QR 3
       │ ───────────────────────► Escanear
       │       ...
       │       QR N
       │ ───────────────────────► Escanear
       │
       │                         Reordenar
       │                            │
       │                            ▼
       │                         Reconstruir
       │                            │
       │                            ▼
       │                       Validar integridad
       │                            │
       │                            ▼
       │                      Transferencia OK
```

### 2.3 Restricciones del producto

- Debe funcionar sin conexión a Internet y sin servidor intermediario (tras la primera carga de la aplicación).
- Los datos viajan íntegramente dentro de los QR.
- El emisor no recibe información del receptor (no hay canal de retorno); el progreso solo existe en el receptor.
- El producto se construye sobre el proyecto base angular-base (ver sección 4); el stack Angular es una restricción impuesta por el equipo.
- Los datos persistentes se guardan solo en el almacenamiento privado de la aplicación (decisión del usuario, ver NFR-004).
- El protocolo se mantiene separado de la interfaz y del mecanismo de captura o visualización de QR, con versión de formato (requerimiento original, ver NFR-005).
- Sin límite fijo de tamaño de archivo (más allá del máximo de fragmentos del protocolo, FR-024): solo el aviso de tiempo estimado y un error si no cabe en el almacenamiento disponible o si requiere más fragmentos de los que admite el protocolo (FR-024).
- Fragmento por defecto de 1600 B por QR con corrección de errores de nivel M, con el QR mostrado lo más grande que permite la pantalla, y velocidad por defecto de 8 QR por segundo (decisión del usuario tras las pruebas con dispositivos; el spike validó 400 B y las pruebas posteriores con ZXing-wasm confirmaron la lectura con 800 B, ver FR-003, FR-031, FR-032 y R-10).
- Un solo QR en pantalla a la vez y uno por cuadro en la lectura.
- La lectura de QR se hace solo con `zxing-wasm` (WebAssembly), servido con la aplicación: NO se usan `BarcodeDetector` ni `jsQR` (NFR-012, NFR-013).

### 2.4 Características de los usuarios

- **Persona con dos dispositivos:** transfiere entre sus propios equipos; nivel técnico variable.
- **Dos personas cara a cara:** una muestra su pantalla y la otra apunta su cámara.
- Ambos casos tienen la misma importancia; no se requiere identificación ni cuenta.

### 2.5 Supuestos y dependencias

**Funcionalidad transversal asumida**

| Capacidad | Supuesto | Origen |
| --------- | -------- | ------ |
| Autenticación y roles | No aplica: la aplicación no tiene cuentas de usuario | Restricción del requerimiento original |
| Notificaciones, pagos, búsqueda, auditoría | No aplica: no forman parte del alcance | Inferido del alcance |
| Funcionamiento offline (PWA) | Se reutiliza del proyecto base, que incluye service worker | Proyecto base angular-base |

- Idioma de la interfaz: español. No se definen requisitos de accesibilidad específicos en esta versión.
- Se asume que el usuario puede cargar la aplicación una vez con red en cada dispositivo antes de usarla sin conexión.
- **Spikes completados** ([WI-001](references/spike-report-WI-001-protocolo-transferencia-qr.md), viable con trabajo; [WI-002](references/spike-report-WI-002-medicion-qr-android.md), viable con trabajo): validaron la lectura de QR de 400 B con corrección M en Chrome 154 sobre Android 10 (10 de 10) y aportaron los NFR de rendimiento y compatibilidad (NFR-008 a NFR-011). **Sin validar con cámara real:** transferencia completa de 1 MB, funcionamiento sin red con la app instalada y elección de transferencia con una secuencia ajena; quedan por verificar con cámara real.
- **Decisiones de diseño del protocolo:** se definen en 2.6.
- **Lagunas que se resuelven en las tareas** (no bloquean el SRS): estrategia de actualización del service worker (NFR-011).

### 2.6 Decisiones de diseño del protocolo

El protocolo vive separado de la interfaz (NFR-005). Estos valores se definieron a partir del spike WI-001; cambiarlos exige subir la versión del formato.

| Aspecto | Decisión | Requisitos |
| ------- | -------- | ---------- |
| Versión del formato | 3; es el primer byte de cada fragmento. Un fragmento de otra versión se rechaza | NFR-005, FR-008 |
| Estructura del fragmento | Binario: versión (1 B), tipo (1 B), identificador de transferencia aleatorio de 32 bits (4 B), posición (2 B), total (2 B), longitud de la carga (2 B), carga y CRC32 de todo lo anterior (4 B) | FR-003 |
| Fragmentación | La posición 0 es el fragmento de metadatos y lleva, tras ellos, los primeros datos hasta llenar su capacidad; las posiciones 1 a n−1 llevan el resto, en bloques del tamaño elegido (1600 B por defecto). El total incluye el fragmento de metadatos | FR-003, FR-004 |
| Metadatos | SHA-256 del archivo original (32 B), tamaño original (4 B), tamaño transmitido (4 B), codificación (1 B: 0 sin comprimir, 1 deflate), longitud del nombre (2 B), longitud del tipo (2 B), nombre y tipo en UTF-8. Si no caben en un fragmento (nombre largo con 200 B) se rechaza | FR-004, FR-032 |
| Compresión | Deflate sin cabecera (RFC 1951) con las funciones nativas del navegador; solo se transmite comprimido si el resultado es menor. El hash es el del archivo original | FR-030 |
| Código QR | Modo byte (carga binaria) con corrección de errores de nivel M | FR-003, NFR-012 |
| Validación en el receptor | Se rechaza un fragmento con versión distinta, longitud inconsistente, posición fuera del total, tipo que no corresponde a la posición (0 = metadatos) o CRC32 incorrecto; el rechazo no lanza errores porque la cámara produce lecturas ruidosas | FR-008 |
| Sincronización | Sin canal de retorno: el emisor repite la secuencia en bucle; el receptor fija la transferencia con el primer fragmento válido, descarta los de otra transferencia o con otro total, e ignora los repetidos | FR-006, FR-008 a FR-010, FR-023 |
| Reconstrucción | Con todos los fragmentos: la suma de bytes coincide con el tamaño transmitido; si está comprimido, se descomprime con tope en el tamaño original anunciado; el tamaño y el SHA-256 deben coincidir. Fallo de tamaño o descompresión → «no reconstruible»; fallo de hash → «datos inválidos» | FR-012, FR-013, FR-030 |
| Límite de fragmentos | 65 535 por transferencia (posición y total de 16 bits, metadatos incluidos): unos 100 MB con 1600 B. Se valida con el tamaño original antes de leer el archivo | FR-024 |
| Velocidad | Elegible entre 4, 6, 8, 10 y 12 QR por segundo; 8 por defecto y fija durante la emisión (no hay regla automática: no se adopta) | FR-005, FR-031 |
| Retención del QR | 3 s al iniciar, reiniciar o elegir un QR en la barra | FR-026, FR-028 |
| Tiempo por vuelta (emisor) | Cantidad de QR × (1 / QR por segundo) | FR-002 |
| Tiempo restante (receptor) | (QR totales − recibidos) ÷ ritmo medido, con ritmo = (recibidos − 1) ÷ segundos desde que se leyeron los metadatos; no se muestra hasta tener al menos 2 QR | FR-011 |

## 3. Stack tecnológico

<!-- srs:stack-mode=decided -->
**Modo de resolución:** Definido por el usuario

| Capa | Tecnología | Justificación |
| ---- | ---------- | -------------- |
| Frontend | Angular 22, TypeScript, Tailwind CSS 4 (según [angular-base](https://github.com/juanca202/angular-base)) | Decisión del equipo: partir del proyecto base |
| Backend | Ninguno | El requerimiento prohíbe servidor intermediario |
| Base de datos | Ninguna; almacenamiento privado del navegador | Decisión del usuario: guardar archivos en el almacenamiento privado de la app con exportación manual |
| Infraestructura / despliegue | PWA con service worker (incluido en angular-base) | Funcionamiento offline tras la primera carga |
| Pruebas | Vitest y Playwright (incluidos en angular-base) | Heredado del proyecto base |
| Librerías de QR | `qrcode` (generación) y `zxing-wasm` (lectura de los bytes, única vía de lectura, con su `.wasm` servido con la aplicación) | `jsQR` y `BarcodeDetector` quedan descartados: en el móvil de pruebas `BarcodeDetector` falla siempre con `Barcode detection service unavailable` y con carga binaria devolvía el texto vacío; `jsQR` leía 13 QR de 651 cuadros; `zxing-wasm` funcionó bien (NFR-012, NFR-013; spike [WI-003](references/spike-report-WI-003-lectura-qr-android.md)) |

**Decisiones pendientes:** Ninguna a nivel de stack. Las decisiones de diseño del protocolo se definen en 2.6.

## 4. Repositorios e implementación

| Repositorio | Tipo | Proyecto base | Notas |
| ----------- | ---- | -------------- | ----- |
| laboratorio-1 | Existente (con cambios) | No aplica | Repositorio de este proyecto, basado en [angular-base](https://github.com/juanca202/angular-base); aplicación web única (emisor y receptor en la misma app) |

## 5. Requisitos funcionales

| ID | Categoría | Prioridad | Estado | Enunciado |
| -- | --------- | --------- | ------ | --------- |
| FR-001 | Interacción de usuario | Esencial | Aprobado | Al pulsar «Enviar», el sistema DEBE abrir el selector de archivos del dispositivo y permitir elegir un solo archivo de cualquier tipo por transferencia; si el usuario cierra el selector sin elegir, el sistema NO DEBE iniciar ninguna transferencia. |
| FR-002 | Salidas del sistema | Alta | Aprobado | Al elegir el archivo, el sistema DEBE mostrar, en una hoja inferior sobre el inicio, la secuencia de QR y, en la cabecera de la hoja sobre el QR, el nombre, tipo y tamaño del archivo, la cantidad total de QR y el tiempo estimado por vuelta, sin mostrar progreso de transmisión; el tiempo estimado por vuelta se muestra desde el inicio (cantidad de QR × duración de cada QR). |
| FR-003 | Procesamiento de datos | Esencial | Aprobado | El sistema DEBE dividir el archivo en fragmentos aptos para un QR, cada uno con identificador de transferencia, posición, número total de fragmentos, verificación de integridad propia y su contenido; por defecto, 1600 B de datos por QR (configurable, FR-032) con corrección de errores de nivel M; el primer fragmento DEBE llevar los metadatos del archivo (FR-004) y, a continuación, los primeros datos hasta llenar su capacidad, para no desperdiciar un QR; y el emisor DEBE mostrar el QR lo más grande que permita la pantalla sin desbordarla, con un número entero de píxeles del dispositivo por módulo (sin escalado que deforme los módulos), para que sigan siendo legibles con fragmentos mayores. El spike validó 400 B (10 lecturas de 10 a unos 30 cm) y las pruebas posteriores con ZXing-wasm confirmaron la lectura con 800 B; el tamaño por defecto de 1600 B es una decisión del usuario, pendiente de validar con una serie de 10 lecturas secuenciales a unos 30 cm con al menos 9 aciertos (R-10). |
| FR-004 | Procesamiento de datos | Esencial | Aprobado | El sistema DEBE transmitir el nombre, el tipo, el tamaño original, el tamaño transmitido, la codificación de los datos y el hash SHA-256 del archivo original junto con su contenido para que el receptor los recupere y verifique. |
| FR-005 | Salidas del sistema | Esencial | Aprobado | Al elegir el archivo, el emisor DEBE mostrar el primer QR fijo, sin avanzar, hasta que el usuario lo toque (FR-026); desde ese primer toque DEBE mostrar los QR de forma secuencial con una velocidad de cambio que parte de un valor por defecto (8 QR por segundo) y que el usuario puede cambiar (FR-031), sin más intervención del usuario. |
| FR-006 | Flujos de proceso | Esencial | Aprobado | El emisor DEBE repetir la secuencia de QR en bucle hasta que su usuario cierre la hoja de envío (FR-014). |
| FR-007 | Interacción de usuario | Esencial | Aprobado | Al pulsar «Recibir», el sistema DEBE activar la cámara y leer automáticamente el QR de cada cuadro (uno por cuadro) sin que el usuario tome fotografías individuales; el receptor NO DEBE iniciar una lectura nueva mientras otra está en curso. |
| FR-008 | Procesamiento de datos | Esencial | Aprobado | El receptor DEBE tomar como transferencia activa la primera de la que lea sus metadatos y descartar los fragmentos de otra transferencia, los corruptos o inválidos y los de una versión de formato que no soporte; para cambiar de transferencia el usuario DEBE cancelar e iniciar de nuevo la recepción. La activación es automática, sin confirmación del usuario (FR-023). |
| FR-009 | Procesamiento de datos | Esencial | Aprobado | El receptor DEBE aceptar los fragmentos en cualquier orden y reordenarlos según su posición. |
| FR-010 | Procesamiento de datos | Esencial | Aprobado | El receptor DEBE ignorar los fragmentos que ya recibió, sin alterar el resultado. |
| FR-011 | Salidas del sistema | Alta | Aprobado | Durante la recepción, el sistema DEBE mostrar el nombre del archivo y, en una misma fila con reparto uniforme y en este orden, su tamaño total, el tiempo estimado restante y el porcentaje recibido; los fragmentos recibidos del total se muestran en la barra de fragmentos (FR-029), que es la única barra de la pantalla. |
| FR-012 | Procesamiento de datos | Esencial | Aprobado | Al tener todos los fragmentos, el receptor DEBE reconstruir el archivo y verificar su integridad automáticamente, sin acción del usuario, y liberar la cámara; solo entonces DEBE considerar la transferencia completada. |
| FR-013 | Salidas del sistema | Esencial | Aprobado | El receptor DEBE informar el resultado de la transferencia: **completada** (todos los fragmentos recibidos y verificación de integridad satisfactoria); **incompleta** (el usuario termina la lectura con el botón «Cerrar» y faltan fragmentos); **datos inválidos** (todos los fragmentos recibidos pero la verificación de integridad falla); **no reconstruible** (no se puede ensamblar el archivo, por ejemplo por metadatos inconsistentes); **almacenamiento lleno** (la recepción está completa y verificada, pero la cuota se agota al guardar: el sistema NO DEBE guardar ni registrar el archivo y DEBE ofrecer descargarlo en ese momento). |
| FR-014 | Casos de uso | Esencial | Aprobado | El usuario DEBE poder cancelar en cualquier momento, tanto en el emisor como en el receptor; la cancelación DEBE detener el proceso local, descartar los datos parciales y liberar sus recursos, incluida la cámara, sin pedir confirmación. El emisor se cancela cerrando la hoja de envío (tocando fuera de ella o arrastrándola); el receptor, con «Cancelar» en el menú ⋮ de su hoja o cerrándola de la misma forma. La copia del archivo ya guardada por el emisor (FR-018) se conserva. |
| FR-015 | Procesamiento de datos | Esencial | Aprobado | Al completarse una recepción, el sistema DEBE guardar el archivo con su nombre y tipo originales en el almacenamiento privado de la aplicación, sin solicitar permisos de carpeta; un archivo con el mismo nombre que otro existente NO DEBE sobrescribirlo. |
| FR-016 | Salidas del sistema | Esencial | Aprobado | El sistema DEBE mostrar un historial de transferencias (enviadas y recibidas) con su contenido, ordenado del más reciente al más antiguo, con filtro Todos / Recibidos / Enviados, y permitir exportar cada archivo con su nombre original (descarga o compartir con otras aplicaciones del dispositivo). |
| FR-017 | Casos de uso | Esencial | Aprobado | El sistema DEBE permitir transferir archivos de tamaño superior al que cabe en un único QR, usando múltiples QR. |
| FR-018 | Procesamiento de datos | Alta | Aprobado | Al iniciar el envío de un archivo, el sistema DEBE guardar una copia en el almacenamiento privado de la aplicación para que figure en el historial como «enviado» con la fecha de inicio del envío (el emisor no sabe si el receptor lo recibió); enviar de nuevo el mismo archivo crea una entrada nueva. |
| FR-019 | Casos de uso | Alta | Aprobado | El usuario DEBE poder eliminar archivos del historial, previa confirmación, para liberar el espacio que ocupan. |
| FR-020 | Interacción de usuario | Alta | Aprobado | Al completarse una recepción, el receptor DEBE detener la lectura y mostrar, en una hoja inferior sobre el inicio, un mensaje de éxito («Archivo <nombre> recibido exitosamente.») con una previsualización del archivo (la imagen si lo es; en otro caso, un icono de archivo con su nombre) y solo dos acciones: «Abrir» (lo muestra si el tipo se puede visualizar y, en otro caso, lo descarga, igual que el clic en la previsualización) y «Descargar»; al cerrar la hoja (tocando fuera de ella o arrastrándola) queda el inicio con el historial actualizado. |
| FR-021 | Flujos de proceso | Alta | Aprobado | Tras un resultado «incompleta», el receptor DEBE permitir seguir escaneando (reactivando la cámara) conservando los fragmentos válidos ya recibidos; tras «datos inválidos», «no reconstruible» o «almacenamiento lleno» DEBE permitir reintentar desde cero. Los fragmentos parciales solo permanecen en memoria mientras el usuario esté en el flujo de recepción (incluida la hoja de resultado) y NO DEBEN persistirse: salir del flujo o recargar los descarta. |
| FR-022 | Salidas del sistema | Alta | Aprobado | El sistema DEBE informar con un aviso en la pantalla donde ocurra, sin iniciar la transferencia, cuando: no haya cámara, el usuario deniegue el permiso de cámara, el archivo esté vacío o no quepa en el almacenamiento disponible, falle la copia local del envío por cuota agotada (FR-018, el envío NO DEBE iniciarse), la cuota de almacenamiento se agote al guardar una recepción (resultado «almacenamiento lleno» de FR-013), o el navegador no sea compatible. Las recepciones fallidas NO DEBEN registrarse en el historial. |
| FR-023 | Flujos de proceso | Esencial | Aprobado | El receptor DEBE activar por sí mismo, sin pedir confirmación al usuario, la primera transferencia de la que lea los metadatos, mostrar de inmediato su nombre, tamaño y avance, e ignorar los fragmentos de las demás transferencias durante el resto de esa recepción; las transferencias leídas antes de esa activación y distintas de ella se descartan. Al recibir todos los fragmentos de la transferencia activa, el receptor DEBE reconstruirla, verificarla y guardarla sin intervención del usuario. Si el usuario descubre que se activó una transferencia ajena, DEBE poder cancelar e iniciar una recepción nueva (FR-008, FR-014). |
| FR-024 | Salidas del sistema | Alta | Aprobado | El sistema DEBE informar con un mensaje claro, sin iniciar la transferencia, cuando el archivo requiera más fragmentos de los que admite el protocolo. |
| FR-025 | Procesamiento de datos | Media | Aprobado | Al guardar un archivo recibido, el sistema DEBERÍA solicitar almacenamiento persistente para reducir el riesgo de que el navegador lo borre. |
| FR-026 | Interacción de usuario | Media | Aprobado | El primer toque sobre el código QR en pantalla DEBE iniciar la secuencia y, en cualquier toque posterior, el emisor DEBE reiniciar la vuelta: en ambos casos DEBE mostrar el primer QR, mantenerlo durante unos 3 segundos para que el receptor pueda capturarlo y después continuar la secuencia con la velocidad normal (FR-005). Mientras espera el primer toque, el emisor DEBE indicar que hay que tocar el QR para iniciar. |
| FR-027 | Salidas del sistema | Baja | Aprobado | Al abrir la pantalla de recepción con el parámetro `?debug`, el receptor DEBERÍA mostrar contadores de cada etapa de la lectura (cuadros procesados, QR vistos, QR leídos con su tamaño en bytes, fragmentos válidos, tamaño del vídeo y último error) para diagnosticar una lectura que no avanza; sin ese parámetro NO DEBE mostrarlos. |
| FR-028 | Interacción de usuario | Alta | Aprobado | El emisor DEBE mostrar bajo el QR una barra horizontal que represente el orden de los QR de la vuelta, con una marca vertical que indique cuál se está mostrando, y el número de QR actual y total. El usuario DEBE poder tocar o arrastrar la barra (o usar el teclado) para elegir un QR: el emisor DEBE mostrarlo, retenerlo unos 3 segundos y continuar la secuencia desde ahí con la velocidad normal, aun si aún esperaba el primer toque (FR-026). |
| FR-029 | Salidas del sistema | Alta | Aprobado | El receptor DEBE mostrar una barra horizontal con el mismo orden que la del emisor en la que se distingan los QR ya recibidos de los que faltan, para que el usuario sepa en qué tramo de la secuencia debe buscar y pueda elegirlo en la barra del emisor (FR-028). |
| FR-030 | Procesamiento de datos | Alta | Aprobado | El emisor DEBE comprimir el contenido del archivo (deflate, con las funciones nativas del navegador) antes de fragmentarlo cuando eso lo haga más pequeño, para transmitir menos QR; si no se comprime (no reduce el tamaño, el archivo está vacío o el navegador no puede), DEBE transmitirlo tal cual. El hash de integridad DEBE ser el del archivo original. El receptor DEBE descomprimir el contenido, comprobar que su tamaño y su hash coinciden con los anunciados y entregar el archivo original, sin intervención del usuario; si los datos comprimidos son inválidos o se expanden más allá del tamaño anunciado, DEBE terminar como «no reconstruible». El emisor DEBE indicar, cuando comprime, el tamaño que se transmite. El número de QR se calcula sobre el contenido transmitido. |
| FR-031 | Interacción de usuario | Alta | Aprobado | El emisor DEBE ofrecer elegir la velocidad de la secuencia, en el menú ⋮ de la cabecera de la hoja de envío (con las opciones desplegadas y la vigente marcada), entre 4, 6, 8, 10 y 12 QR por segundo (8 por defecto); al cambiarla con la secuencia en marcha, el QR en pantalla y su retención (FR-026) se mantienen, el siguiente llega con el nuevo intervalo y el tiempo estimado por vuelta se recalcula; la elección DEBE recordarse en el almacenamiento local del navegador y recuperarse al volver a cargar la página (FR-033). La velocidad adecuada depende de los cuadros por segundo que procese el receptor (lo orienta el panel de FR-027). |
| FR-032 | Interacción de usuario | Alta | Aprobado | El emisor DEBE ofrecer elegir el tamaño de fragmento (densidad), en el menú ⋮ de la cabecera de la hoja de envío (con las opciones desplegadas y la vigente marcada), entre 200, 400, 800, 1200 y 1600 B de archivo por QR (1600 por defecto). Al cambiarlo, el emisor DEBE volver a fragmentar el archivo, que pasa a ser una transferencia nueva (otros fragmentos e identificador): DEBE actualizar la cantidad de QR y el tiempo por vuelta, volver a esperar el primer toque (FR-005), conservar la velocidad elegida (FR-031), recordar la nueva densidad (FR-033) y no volver a guardar la copia del archivo (FR-018); y DEBE avisar de que el receptor debe empezar de nuevo. Si el nuevo tamaño no es viable (el nombre del archivo no cabe en un fragmento tan pequeño, o el archivo necesitaría más fragmentos de los que admite el protocolo), DEBE avisar y conservar la transferencia y el tamaño actuales. |
| FR-033 | Interacción de usuario | Alta | Aprobado | El emisor DEBE recordar, en el almacenamiento local del navegador, la velocidad (FR-031) y la densidad (FR-032) que el usuario eligió y aplicarlas al volver a cargar la página, de modo que el menú ⋮ muestre marcados esos valores y el archivo se fragmente con la densidad recordada. Solo se guardan valores de las opciones vigentes: un valor guardado que ya no sea una opción (alterado o de una versión anterior) se ignora y se usa el de por defecto; una densidad que no se pudo aplicar (FR-032) no se guarda; y un almacenamiento no disponible (modo privado, cuota) NO DEBE interrumpir el envío. La preferencia no incluye ningún dato del archivo (NFR-001, NFR-004). |
| FR-034 | Salidas del sistema | Alta | Aprobado | Mientras dure una transferencia (el emisor mostrando la secuencia, el receptor abriendo la cámara y leyendo hasta tener un resultado), el sistema DEBERÍA mantener la pantalla encendida con la función de bloqueo de pantalla del navegador (Screen Wake Lock), para que ni se atenúe o apague la pantalla del emisor ni el receptor pierda la imagen de la cámara; DEBE volver a pedirla al recuperar la visibilidad de la pestaña mientras siga haciendo falta, liberarla al terminar, cancelar o salir de la pantalla, y seguir funcionando sin ella si el navegador no la ofrece o la rechaza. |
| FR-036 | Salidas del sistema | Alta | Aprobado | Sobre la imagen de la cámara, el receptor DEBE dibujar un recuadro alrededor del QR solo mientras lo detecta, alineado con su posición en la imagen mostrada (incluso con recorte de la imagen), y NO DEBE mostrar un recuadro fijo cuando no hay QR; ante un cuadro en el que no se lee el QR, el recuadro DEBERÍA mantenerse unos 0,4 s para no parpadear, y DEBE desaparecer al detener la lectura. |

## 6. Requisitos no funcionales

| ID | Categoría | Prioridad | Estado | Enunciado |
| -- | --------- | --------- | ------ | --------- |
| NFR-001 | Seguridad | Esencial | Aprobado | Durante el envío o la recepción de un archivo, el sistema NO DEBE enviar el contenido ni los metadatos del archivo fuera de los dos dispositivos, ni realizar peticiones de red de ningún tipo (incluida telemetría). |
| NFR-002 | Fiabilidad | Esencial | Aprobado | Tras la primera carga con red, el sistema DEBE funcionar completamente sin conexión a Internet. |
| NFR-003 | Fiabilidad | Esencial | Aprobado | El archivo recibido DEBE ser idéntico byte a byte al original, comprobado con una verificación de integridad. |
| NFR-004 | Seguridad | Alta | Aprobado | El sistema DEBE persistir datos solo en el almacenamiento privado de la aplicación (incluido el almacenamiento local del navegador para las preferencias de FR-033, que no contienen datos de archivos) y NO DEBE leer ni escribir en el resto del sistema de archivos por iniciativa propia; la exportación, iniciada por el usuario, es la única salida de archivos. |
| NFR-005 | Mantenibilidad | Alta | Aprobado | El protocolo de transferencia DEBE estar separado de la interfaz de usuario y del mecanismo concreto de mostrar o capturar QR, y el formato DEBE incluir un número de versión para permitir su evolución. |
| NFR-006 | Usabilidad | Alta | Aprobado | Todas las pantallas (incluidos sus estados de error) DEBEN ser operables, sin desplazamiento horizontal, desde 360 px de ancho (móvil en retrato) hasta 1280 px o más (escritorio). |
| NFR-007 | Seguridad | Alta | Aprobado | La previsualización y apertura de un archivo recibido NO DEBEN ejecutar contenido activo del archivo (por ejemplo, scripts incrustados en SVG o HTML). |
| NFR-008 | Compatibilidad | Alta | Aprobado | El sistema DEBE funcionar en Chrome para Android (probado en Chrome 154 sobre Android 10); el receptor DEBE leer los QR siempre con `zxing-wasm`, sin depender de ninguna API de detección del navegador. El funcionamiento en otros navegadores (Safari/iOS, Firefox) no se garantiza en esta versión. |
| NFR-009 | Eficiencia de rendimiento | Alta | Aprobado | El receptor DEBE leer un QR de 400 B con corrección M a unos 30 cm en al menos 9 de 10 intentos secuenciales. |
| NFR-010 | Eficiencia de rendimiento | Media | Aprobado | El sistema DEBERÍA transferir un archivo de 1 MB en 15 minutos o menos; este objetivo no está validado con cámara real y se verifica con transferencias reales. |
| NFR-011 | Fiabilidad | Media | Aprobado | La aplicación instalada DEBERÍA actualizarse a la versión nueva sin quedarse indefinidamente en una versión antigua (hallazgo H-13 del spike). |
| NFR-012 | Fiabilidad | Alta | Aprobado | El receptor DEBE obtener los bytes de cada QR sin alterarlos (carga binaria) usando únicamente `zxing-wasm`; NO DEBE usar `BarcodeDetector` ni `jsQR`, ni depender de la representación en texto del QR ni de servicios del dispositivo para detectarlo. |
| NFR-013 | Fiabilidad | Alta | Aprobado | El lector de QR (módulo WebAssembly de `zxing-wasm`) DEBE servirse con la aplicación y quedar precacheado por el service worker, de modo que la lectura funcione sin conexión (NFR-002) sin hacer peticiones de red durante la recepción (NFR-001), y DEBE cargarse al empezar la recepción, antes del primer cuadro. |

**Origen de NFR-012 y NFR-013:** spike [WI-003](references/spike-report-WI-003-lectura-qr-android.md) y decisión del usuario. **Origen de NFR-008 a NFR-011:** propuestos por el spike WI-002 y decididos por el usuario (compatibilidad solo Chrome en Android; 1 MB en 15 min como objetivo). **Origen de FR-026 y FR-027:** pruebas con dispositivos reales. **Portabilidad** queda cubierta por NFR-006 (pantallas) y NFR-008 (navegadores).

## 7. Reglas de negocio

- **BR-01:** Una transferencia DEBE incluir exactamente un archivo. → relacionado con FR-001
- **BR-02:** Una transferencia DEBE considerarse completada solo si la verificación de integridad es satisfactoria. → relacionado con FR-012, FR-013
- **BR-03:** Si la verificación falla o faltan fragmentos, el sistema NO DEBE guardar el archivo recibido ni registrarlo en el historial. → relacionado con FR-013, FR-015, FR-022

## 8. Interfaces externas

### 8.1 Interfaces de usuario

- Aplicación web responsiva (móvil en retrato y escritorio); pantalla de inicio sencilla con dos acciones principales, Enviar y Recibir (tarjetas lado a lado en escritorio y apiladas en móvil), y la actividad reciente (historial) debajo; Enviar y Recibir se abren como hoja inferior sobre el inicio (diálogo centrado en escritorio) (ver sección 11).

### 8.2 Interfaces de hardware

- Cámara del dispositivo (receptor): lectura de los QR.
- Pantalla del dispositivo (emisor): visualización de los QR.

### 8.3 Interfaces de software

- Funciones del navegador: acceso a la cámara, almacenamiento privado de la aplicación, selector de archivos, descarga y compartir, y service worker para el modo offline. Disponibilidad confirmada en Chrome 154 sobre Android 10 (cámara, service worker, compartir archivos, almacenamiento privado, `storage.persist` no activo por defecto); la lectura de QR no usa APIs de detección del navegador: se hace con `zxing-wasm` en WebAssembly (NFR-012, NFR-013).

### 8.4 Interfaces de comunicaciones

No aplica: el único canal entre dispositivos es óptico (pantalla → cámara) y no hay comunicación de red durante la transferencia (NFR-001).

## 9. Requisitos de datos

| Entidad de datos | Descripción | Retención / privacidad | Volumen estimado |
| ------------------ | ------------ | ------------------------ | ------------------- |
| Archivo del historial | Contenido, nombre, tipo y tamaño de un archivo enviado o recibido | Se conserva hasta que el usuario lo elimina; puede contener datos personales o sensibles; sin cifrar en esta versión | Limitado por la cuota de almacenamiento del navegador |
| Registro de transferencia | Dirección (enviado/recibido) y fecha: la de inicio del envío, o la de la recepción exitosa; las recepciones fallidas no se registran | Igual que el archivo asociado | Uno por transferencia |

## 10. Cumplimiento normativo

No aplica: no se identificó normativa específica y los datos se procesan solo en los dispositivos del usuario (NFR-001). Si se maneja información sujeta a protección de datos personales, la ausencia de cifrado (fuera de alcance, sección 1.2) es un riesgo (ver R-03).

## 11. Diseño de interfaz (wireframes)

<!-- srs:ui-required=true -->
**¿Requiere diseño de interfaz?** Sí

**Tipo de solución:** Aplicación web

**¿Debe ser responsiva (adaptable a distintos tamaños de pantalla)?** Sí

| Pantalla | Wireframe | Estado de revisión | Observaciones ya incorporadas |
| -------- | --------- | --------------------- | -------------------------------- |
| Inicio e historial | [WF-001](wireframes/WF-001-inicio-historial.md) | Aprobado | Estructura del 2026-10-09: cabecera «QRTransfer», tarjetas Enviar/Recibir (horizontales en escritorio, verticales en móvil) y «Actividad reciente»; Enviar y Recibir se abren como hoja inferior (diálogo en escritorio) con el inicio atenuado detrás, igual en WF-002, WF-004 y WF-005. Interfaz sencilla: dos botones con icono (Enviar / Recibir) y el historial debajo con filtros (FR-001, FR-007, FR-016, FR-019); variante móvil añadida (NFR-006). |
| Enviar: QR e información | [WF-002](wireframes/WF-002-enviar-seleccion.md) | Aprobado | Densidad y velocidad como opciones del menú ⋮ de la cabecera (FR-031, FR-032). Enviar abre el selector; al elegir se muestra una hoja con la información del archivo en la cabecera y debajo solo el QR (fijo, el primero), sin progreso porque el emisor no sabe cuánto recibió el otro (FR-002, FR-006, FR-014); el QR es pulsable: el primer toque inicia la secuencia y los siguientes reinician la vuelta, reteniendo el primero unos 3 s (FR-005, FR-026). Bajo el QR, barra con marca de posición, interactiva, para continuar desde otro QR (FR-028), y como único texto «Toca el QR para iniciar o reiniciar la vuelta». La hoja no tiene «Cancelar»: se cierra tocando fuera de ella o arrastrándola (FR-014). Reemplaza la pantalla de transmisión previa (el identificador WF-003 se retiró y no se reutiliza). |
| Recibir: escaneo e información | [WF-004](wireframes/WF-004-recibir-escaneo.md) | Aprobado | Sin aviso de confirmación: la transferencia se activa sola al leer sus metadatos (FR-023); cámara sin marco fijo: el recuadro se dibuja sobre el QR solo mientras se detecta (FR-036); panel de diagnóstico solo con `?debug` (FR-027). Cabecera con el nombre y «QR n de N»; cámara; fila con peso, tiempo y porcentaje (FR-011) y bajo ella la única barra, la de QR recibidos y faltantes (FR-029); botón «Cerrar» para declarar «incompleta» (FR-013). |
| Resultado y previsualización | [WF-005](wireframes/WF-005-resultado-recepcion.md) | Aprobado | Variante «almacenamiento lleno» con opción de descargar (FR-013, FR-022).  Al terminar: hoja con mensaje de éxito, previsualización (imagen o icono con nombre; clic abre el archivo) y solo «Abrir» y «Descargar»; el historial queda en el inicio (FR-020); variantes de error incluidas (Seguir escaneando / Reintentar, FR-021). Los valores de los wireframes (412 QR, tiempos) son solo ejemplos. |

**Navegación y comportamientos por defecto**

| Desde | Acción | Destino / comportamiento |
| ----- | ------ | ------------------------ |
| WF-001 | Enviar → elegir archivo | WF-002 con el QR en bucle; cerrar el selector sin elegir deja en WF-001 |
| WF-001 | Recibir | WF-004 con la cámara activa |
| WF-002 / WF-004 | Cancelar | Vuelve a WF-001; descarta lo parcial (el emisor conserva la copia ya guardada) |
| WF-002 | Elegir archivo | Muestra el primer QR fijo, sin avanzar, y la información del archivo (FR-005) |
| WF-002 | Tocar o arrastrar la barra | Muestra el QR elegido, lo retiene unos 3 s y continúa desde él (FR-028) |
| WF-002 | Tocar el QR | El primer toque inicia la secuencia y los siguientes reinician la vuelta: muestra el primer QR unos 3 s y sigue con la cadencia normal (FR-026) |
| WF-004 | Cerrar (antes «Terminar lectura») | Con la transferencia activa y fragmentos faltantes, WF-005 en «incompleta»; si aún no se leyeron los metadatos de ninguna transferencia, equivale a Cancelar |
| WF-004 | Metadatos leídos | La transferencia se activa sola y se muestran su nombre, tamaño y avance, sin pedir confirmación (FR-023) |
| WF-004 | Recepción completa | WF-005 en «completada», sin acción del usuario |
| WF-005 | Seguir escaneando | WF-004 con la cámara activa y los fragmentos válidos conservados |
| WF-005 | Reintentar | WF-004 desde cero |
| WF-001 / WF-005 | Historial | Filtro «Todos» por defecto; eliminar pide confirmación (FR-019); los avisos de FR-022 se muestran en la pantalla donde ocurre el caso |

## 12. Verificación y trazabilidad

| ID | Origen | Depende de | Método de verificación | Criterio de verificación |
| -- | ------ | ----------- | -------------------------- | --------------------------- |
| FR-001 | RF-01 del requerimiento original; wireframes | Ninguna | Demostración | Al pulsar Enviar se abre el selector y solo permite elegir un archivo de cualquier tipo; cerrarlo sin elegir no inicia nada. |
| FR-002 | Revisión de wireframes | FR-001 | Inspección | Con el QR visibles nombre, tipo, tamaño, cantidad de QR y tiempo estimado por vuelta; sin barra de avance. |
| FR-003 | RF-02 del requerimiento original; spike WI-002 | Ninguna | Prueba | Cada fragmento decodificado contiene identificador de transferencia, posición, total, verificación propia y contenido; el primer fragmento lleva además los metadatos y se llena con los primeros datos (sin dejar espacio sin usar); por defecto el fragmento es de 1600 B con corrección M y el QR se dibuja tan grande como permite la pantalla; la serie de 10 lecturas secuenciales a unos 30 cm con al menos 9 aciertos queda pendiente de validación con cámara real. |
| FR-004 | Respuestas del usuario (almacenamiento y recepción); [spike WI-002](references/spike-report-WI-002-medicion-qr-android.md) | FR-003 | Prueba | El nombre, el tipo y el hash SHA-256 se recuperan idénticos en el receptor. |
| FR-005 | RF-03 del requerimiento original; respuesta del usuario (velocidad automática); decisión del usuario tras las pruebas con dispositivos (inicio con el primer toque) | FR-003 | Prueba | El primer QR queda fijo hasta el primer toque; desde él la velocidad se fija sin más intervención del usuario y una transferencia completa se logra en el entorno de referencia definido por el spike. |
| FR-006 | RF-07 del requerimiento original (sustituido en parte por el bucle); respuesta del usuario | FR-005 | Prueba | Tras tres vueltas completas sin cancelar, el emisor sigue mostrando la secuencia; al cancelar se detiene. |
| FR-007 | RF-04 del requerimiento original; spike WI-002 (H-11) | Ninguna | Demostración | El receptor lee la secuencia sin que el usuario capture fotos y no lanza una lectura nueva mientras otra está en curso. |
| FR-008 | RF-02 del requerimiento original; restricciones del requerimiento | FR-003 | Prueba | Con fragmentos de otra transferencia, alterados o de versión desconocida mezclados, el archivo recibido no cambia y se rechazan; la transferencia activa es la primera cuyos metadatos se leyeron. |
| FR-009 | RF-05 del requerimiento original | FR-003 | Prueba | Fragmentos entregados en orden aleatorio producen el mismo archivo. |
| FR-010 | RF-06 del requerimiento original | FR-003 | Prueba | Fragmentos repetidos no cambian el resultado. |
| FR-011 | Revisión de wireframes | FR-007 | Inspección | Durante la recepción, en escritorio y móvil, se muestran el nombre y, en una fila repartida, tamaño total, tiempo estimado restante y porcentaje, en ese orden, sobre la única barra, la de fragmentos recibidos. |
| FR-012 | RF-08 del requerimiento original | FR-009 | Prueba | Con todos los fragmentos leídos, la verificación y el resultado aparecen sin acción del usuario y la cámara se libera; el hash del archivo recibido coincide con el del original en el 100 % de las pruebas completadas. |
| FR-013 | RF-09 del requerimiento original; respuesta del usuario (terminar lectura) | FR-012 | Prueba | Se provocan los cinco resultados: completo → «completada»; «Cerrar» con faltantes → «incompleta»; alterar el contenido con todos los fragmentos → «datos inválidos»; metadatos inconsistentes → «no reconstruible»; cuota agotada al guardar → «almacenamiento lleno» con opción de descargar, sin entrada en el historial. Cada uno muestra su mensaje. |
| FR-014 | RF-10 del requerimiento original | FR-018 | Prueba | Cancelar en emisor o receptor, sin confirmación, detiene el proceso, descarta datos parciales y libera la cámara; la copia ya guardada por el emisor permanece en el historial. |
| FR-015 | Respuestas del usuario (almacenamiento) | FR-012 | Prueba | El archivo recibido queda en el almacenamiento privado con su nombre y tipo originales sin que el navegador pida permiso de carpeta; dos recepciones con el mismo nombre quedan como dos entradas. |
| FR-016 | Respuestas del usuario (historial); revisión de wireframes | FR-015, FR-018 | Demostración | El historial lista recibidos y enviados del más reciente al más antiguo; cada filtro (Todos, Recibidos, Enviados) muestra solo lo que corresponde; cada archivo se exporta con su nombre original. |
| FR-017 | RF-12 del requerimiento original | FR-003 | Prueba | Se transfiere con éxito un archivo mayor que la capacidad de un único QR (valor fijado por el spike). |
| FR-018 | Respuestas del usuario (historial de enviados con contenido) | FR-001 | Prueba | Al iniciar el envío, la copia del archivo figura en el historial. |
| FR-019 | Propuesta del agente confirmada por el usuario | FR-016 | Demostración | Al eliminar, tras confirmar, el archivo desaparece del historial y el espacio de almacenamiento usado disminuye en su tamaño. |
| FR-020 | Revisión de wireframes; decisión del usuario tras las pruebas con dispositivos | FR-015 | Demostración | Al completarse, se detiene la lectura y aparece el mensaje de éxito con solo «Abrir» y «Descargar»; una imagen se previsualiza; otro tipo muestra icono y nombre; el clic abre el archivo (lo muestra si se puede visualizar, lo descarga si no); el historial queda en el inicio al cerrar la hoja. |
| FR-021 | Wireframe WF-005 y respuesta del usuario (terminar lectura) | FR-013 | Prueba | Tras «incompleta», seguir escaneando conserva los fragmentos ya válidos; tras los otros errores, reintentar empieza de cero; al recargar o salir del flujo no queda ningún fragmento almacenado. |
| FR-022 | Validación externa de Ola 3 | FR-001, FR-007, FR-015 | Prueba | Sin cámara o permiso, archivo vacío o que no cabe, cuota agotada o navegador incompatible: se muestra el mensaje y no se inicia; una recepción fallida no aparece en el historial. |
| FR-023 | Spike WI-002 (H-01, H-09); decisión del usuario tras las pruebas con dispositivos (2026-10-08) | FR-008 | Prueba | Sin pedir confirmación, el receptor activa la primera transferencia cuyos metadatos lee, muestra su nombre, tamaño y avance e ignora los fragmentos de otra en cuadro; al recibir todos los fragmentos reconstruye, verifica y guarda sin que el usuario pulse nada, y el archivo guardado es el de la transferencia activa. |
| FR-024 | Spike WI-002 (H-03) | FR-003 | Prueba | Un archivo que exige más fragmentos de los admitidos muestra el mensaje y no inicia la transferencia. |
| FR-025 | Spike WI-002 (H-12) | FR-015 | Inspección | Al guardar una recepción se solicita almacenamiento persistente; su resultado es observable en el navegador. |
| FR-026 | Pruebas con dispositivos reales (2026-10-08); decisión del usuario | FR-006 | Prueba | Sin tocar, el primer QR no cambia; el primer toque inicia la secuencia mostrando el primer QR unos 3 s y luego continúa a la velocidad normal; un toque posterior reinicia la vuelta (cuenta de nuevo desde 1); sin emisión en curso el toque no hace nada. |
| FR-027 | Pruebas con dispositivos reales (2026-10-08) | FR-007 | Inspección | Con `?debug` la pantalla de recepción muestra los contadores (cuadros, QR vistos, leídos con su tamaño, fragmentos válidos, tamaño de vídeo, último error); sin el parámetro no aparecen. |
| FR-028 | Decisión del usuario tras las pruebas con dispositivos (2026-10-08) | FR-006, FR-026 | Prueba | La marca indica el QR en pantalla y avanza con la secuencia; tocar o arrastrar la barra (o usar el teclado) muestra ese QR, lo retiene unos 3 s y continúa desde él; funciona también antes del primer toque; la barra es operable con teclado y expone su posición a las tecnologías de apoyo. |
| FR-029 | Decisión del usuario tras las pruebas con dispositivos (2026-10-08) | FR-009, FR-028 | Prueba | Tras leer algunos QR, la barra del receptor pinta los recibidos y deja sin pintar los que faltan, con la misma ordenación que la barra del emisor; al recibir otro QR se actualiza. |
| FR-030 | Decisión del usuario tras las pruebas con dispositivos (2026-10-08) | FR-003, FR-004, NFR-003 | Prueba | Un archivo muy comprimible genera muchos menos QR que sin comprimir y el receptor lo entrega idéntico byte a byte; uno que no se comprime (datos aleatorios) viaja tal cual y sin indicar «comprimido»; datos comprimidos corruptos o que se expanden más de lo anunciado terminan como «no reconstruible»; el hash comprobado es el del original. |
| FR-031 | Decisión del usuario tras las pruebas con dispositivos (2026-10-08) | FR-005, FR-026 | Prueba | El menú ⋮ ofrece 4, 6, 8, 10 y 12 QR por segundo con 8 por defecto y la vigente marcada; al cambiarlo en marcha se respeta la retención del QR elegido y el siguiente llega a la nueva cadencia; antes del primer toque solo recalcula el tiempo por vuelta; valores no válidos se ignoran. |
| FR-032 | Decisión del usuario tras las pruebas con dispositivos (2026-10-09) | FR-003, FR-005, FR-031 | Prueba | El menú ⋮ ofrece 200, 400, 800, 1200 y 1600 B por QR con 1600 por defecto y la vigente marcada; al elegir otro cambian la cantidad de QR y el tiempo por vuelta, la secuencia espera de nuevo el primer toque, la velocidad y la copia guardada se conservan; con un nombre demasiado largo para 200 B o un archivo demasiado grande para ese tamaño se avisa y no cambia nada. |
| FR-033 | Decisión del usuario tras las pruebas con dispositivos (2026-10-09) | FR-031, FR-032, NFR-004 | Prueba | Se elige otra densidad y velocidad, se recarga la página y, al elegir un archivo, el menú ⋮ muestra marcado lo elegido y el archivo se fragmenta con esa densidad; con valores guardados que no son opciones vigentes se usan los de por defecto; sin localStorage utilizable (o si lanza) el envío funciona con los de por defecto; no se guarda una densidad rechazada; solo se guardan los dos números. |
| FR-034 | Revisión del requisito (2026-10-09); spike WI-002 (`wakeLock` disponible) | FR-005, FR-007 | Prueba | Con transferencia en curso se pide el bloqueo; se libera al cancelar, al tener resultado y al salir; se vuelve a pedir al volver a ver la pestaña; sin la API o con rechazo no hay error ni se interrumpe la transferencia. |
| FR-036 | Decisión del usuario (2026-10-09), tras el spike [WI-003](references/spike-report-WI-003-lectura-qr-android.md) | FR-007 | Prueba | Sin QR en cuadro no se dibuja ningún recuadro; con un QR se dibuja sobre su posición (incluida la imagen recortada); si el QR se pierde unos cuadros el recuadro se mantiene hasta unos 0,4 s y después desaparece; al detener la lectura se borra. |
| NFR-001 | RF-11 del requerimiento original; restricciones | Ninguna | Prueba | Con el tráfico de red capturado, no hay ninguna petición durante el envío ni la recepción. |
| NFR-002 | Restricciones del requerimiento; respuesta del usuario (PWA) | Ninguna | Prueba | Tras la primera carga, la aplicación abre y transfiere sin red. |
| NFR-003 | RF-08 del requerimiento original | FR-012 | Prueba | Comparación byte a byte del archivo recibido con el original, sin diferencias. |
| NFR-004 | Respuesta del usuario (almacenamiento) | FR-015 | Inspección | Revisión de los accesos a almacenamiento y de los permisos: solo hay lecturas y escrituras en el almacenamiento privado (archivos) y en el almacenamiento local (solo las preferencias numéricas de velocidad y densidad); la única salida de archivos es la exportación iniciada por el usuario. |
| NFR-005 | Consideraciones para el diseño del requerimiento | Ninguna | Inspección | El protocolo se ejecuta sin depender de UI ni de cámara, y el formato lleva número de versión. |
| NFR-006 | Respuesta del usuario (responsiva) | Ninguna | Demostración | Las cuatro pantallas y sus estados de error funcionan desde 360 px hasta 1280 px o más de ancho, sin desplazamiento horizontal. |
| NFR-007 | Propuesta del agente confirmada por el usuario | FR-020 | Prueba | Un SVG o HTML con script no ejecuta código al previsualizarse o abrirse. |
| NFR-008 | Spike WI-002; spike [WI-003](references/spike-report-WI-003-lectura-qr-android.md); decisión del usuario | Ninguna | Prueba | Una transferencia completa se logra en Chrome para Android leyendo siempre con `zxing-wasm`, también cuando `BarcodeDetector` falla o no existe. |
| NFR-009 | Spike WI-002 (medido 10 de 10) | FR-007 | Prueba | Serie de 10 lecturas secuenciales de un QR de 400 B con corrección M a unos 30 cm, con al menos 9 aciertos. |
| NFR-010 | Spike WI-002 (H-14); decisión del usuario | FR-005, FR-017 | Prueba | Transferencias reales de 1 MB con hash idéntico; se registra el tiempo y se compara con 15 minutos (objetivo, no bloqueante). |
| NFR-011 | Spike WI-002 (H-13) | NFR-002 | Demostración | Tras desplegar una versión nueva, la aplicación instalada pasa a ella tras recargar, sin quedarse en la antigua. |
| NFR-012 | Spike [WI-003](references/spike-report-WI-003-lectura-qr-android.md); pruebas con dispositivos reales (2026-10-08 y 2026-10-09); hallazgos: `BarcodeDetector` devuelve el texto vacío con carga binaria y falla con `Barcode detection service unavailable` | FR-007 | Prueba | Un QR con bytes de todos los valores se lee con los bytes idénticos usando solo `zxing-wasm`; el receptor no usa `BarcodeDetector` ni `jsQR`. |
| NFR-013 | Decisión del usuario (2026-10-09), tras el spike [WI-003](references/spike-report-WI-003-lectura-qr-android.md) | FR-007, NFR-001, NFR-002 | Prueba | El `.wasm` del lector está entre los archivos precacheados por el service worker; una recepción completa sin conexión y sin peticiones de red lee los QR; el módulo se pide al abrir la recepción, no al leer el primer cuadro. |
| BR-01 a BR-03 | Requerimiento original y respuestas del usuario | FR-001, FR-012, FR-013, FR-015, FR-022 | Prueba | BR-01: no se puede elegir más de un archivo; BR-02: sin verificación satisfactoria no se declara «completada»; BR-03: tras un resultado de error no hay archivo guardado ni entrada en el historial. |

## 13. Riesgos

| ID | Riesgo | Probabilidad | Impacto | Mitigación | Relacionado con |
| -- | ------ | -------------- | ------- | ----------- | ------------------ |
| R-01 | Lectura inestable de QR (brillo, reflejos, velocidad) | Media | Alto | Fragmento de 400 B validado (10 de 10); el bucle da más oportunidades de lectura; regla de velocidad validada en las tareas | FR-005, FR-006, FR-007, NFR-009 |
| R-02 | El navegador limita o borra el almacenamiento privado | Media | Alto | Pedir almacenamiento persistente, avisar cuando se agote (FR-022) y permitir exportar | FR-015, FR-016, FR-018, FR-022 |
| R-03 | Archivos sin cifrar en el dispositivo (sin cifrado, fuera de alcance) | Media | Medio | Eliminación fácil del archivo del historial | FR-019 |
| R-04 | Cámara y modo offline dependen del navegador (contexto seguro, instalación); el modo sin red no se probó en el spike | Media | Alto | Compatibilidad limitada a Chrome en Android (NFR-008); prueba manual en modo avión | NFR-002, NFR-008, FR-007 |
| R-05 | El emisor no sabe si el receptor terminó y puede seguir indefinidamente | Media | Bajo | Cancelación manual disponible en todo momento (FR-014) | FR-006, FR-014 |
| R-06 | Archivos grandes con tiempos poco prácticos: con 400 B por QR, 1 MB son unos 2600 fragmentos y, con 90 % de lectura por vuelta, tarda unos 37 min a 5 fps (varias vueltas; modelo del spike) | Alta | Medio | Mostrar el tiempo estimado; NFR-010 como objetivo; fragmentos mayores validados | FR-002, FR-017, NFR-010 |
| R-07 | Abrir archivos recibidos de tipos arbitrarios | Media | Alto | NFR-007 y FR-020: visor aislado o descarga | FR-020, NFR-007 |
| R-08 | Una secuencia ajena delante puede dejar al receptor con el archivo equivocado (H-01 del spike); sin confirmación de nombre y tamaño el riesgo es aceptado por decisión del usuario | Media | Medio | El receptor muestra el nombre, tamaño y avance de la transferencia activa y el usuario puede cancelar e iniciar de nuevo (FR-008, FR-014, FR-023); prueba con cámara | FR-008, FR-014, FR-023 |
| R-09 | Fuera de Chrome en Android el funcionamiento no está probado (Safari/iOS, Firefox) | Alta | Medio | Alcance limitado por NFR-008; lectura con `zxing-wasm`, que no depende del navegador | NFR-008 |
| R-10 | La lectura de QR de 1600 B (149 módulos por lado, mucho más densos que los 81 de 400 B que validó el spike) desde la pantalla de un laptop puede no ser estable en el móvil (módulos pequeños, brillo, reflejos); las pruebas con `zxing-wasm` confirmaron la lectura con 800 B, pero no hay serie validada con 1600 B con cámara real | Media | Alto | Panel de diagnóstico `?debug` (FR-027) para ubicar la etapa que falla; reinicio de la vuelta al tocar el QR (FR-026); si persiste, QR mostrado lo más grande posible en el emisor; si persiste, volver a 800 B o 400 B según los datos de cámara real | FR-003, FR-007, FR-026, FR-027, NFR-009, NFR-012 |
| R-11 | `BarcodeDetector` falla siempre en el móvil de pruebas y `jsQR` leía muy pocos QR (13 de 651 cuadros); el lector solo con `zxing-wasm` añade unos 940 KB de `.wasm` a la aplicación y su rendimiento con QR de 1600 B no está medido con cámara real | Media | Medio | Lectura solo con `zxing-wasm` (NFR-012), `.wasm` servido y precacheado con la aplicación (NFR-013), panel `?debug` para medir cuadros por segundo y lecturas (FR-027); si no es estable, reducir la densidad | FR-007, FR-027, NFR-012, NFR-013 |

## 14. Enlaces y archivos de apoyo

- **Investigación de stack:** No aplica (stack decidido por el usuario).
- **Spikes:** [WI-001](references/spike-report-WI-001-protocolo-transferencia-qr.md), [WI-002](references/spike-report-WI-002-medicion-qr-android.md), [WI-003](references/spike-report-WI-003-lectura-qr-android.md) y [WI-004](references/spike-report-WI-004-dos-qr-a-la-vez.md) (resumen en 1.4).
- **Wireframes:** [`wireframes/`](wireframes) — detalle por pantalla en la sección 11.

## Validación

### Definition of Ready (DoR)

| Criterio DoR | Estado | Notas |
| ------------ | ------ | ----- |
| Stack tecnológico resuelto | Cumple | Angular 22 sobre angular-base; sin backend |
| Repositorios y proyecto base definidos | Cumple | laboratorio-1, existente (basado en angular-base); proyecto base no aplica |
| Requisitos funcionales completos y priorizados | Cumple | FR-001 a FR-034 y FR-036 aprobados |
| Requisitos no funcionales revisados y priorizados | Cumple | NFR-001 a NFR-013 aprobados |
| Interfaces externas revisadas | Cumple | Usuario, hardware, software; comunicaciones no aplica |
| Requisitos de datos formalizados | Cumple | |
| Cumplimiento normativo trazado | Cumple | No aplica |
| Diseño de interfaz revisado | Cumple | 4 wireframes aprobados |
| Verificación y trazabilidad completas | Cumple | Incluye FR-023 a FR-036 y NFR-008 a NFR-013 |
| Riesgos identificados | Cumple | R-01 a R-11 |
| Alcance y fuera de alcance claros | Cumple | |
| Sin aclaraciones pendientes | Cumple | |
| Validación final (Ola 3) superada | Cumple | Quinta validación externa: «suficiente con reservas»; reservas delegadas |
