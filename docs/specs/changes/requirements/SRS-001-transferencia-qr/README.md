# SRS-001: Transferencia de archivos mediante secuencia de QR

<!-- srs:status=Ready -->
**Estado:** Ready
**Fecha de creación:** 2026-10-08
**Última actualización:** 2026-10-09 (lectura solo con ZXing, un QR por cuadro y valores por defecto: [insumo 04](references/raw-requirement-04-decisiones-lectura-zxing.md); antes, [insumo 03](references/raw-requirement-03-decisiones-pruebas-con-dispositivos.md))

## 1. Introducción

### 1.1 Propósito

Permitir que una persona pase un archivo de un dispositivo a otro usando solo la pantalla de uno y la cámara del otro, mediante una secuencia de códigos QR, en entornos sin red o sin conectividad disponible. Lo usan tanto una persona que transfiere entre sus propios dispositivos como dos personas cara a cara.

### 1.2 Alcance del producto

Aplicación web responsiva e instalable (PWA) que, en un mismo dispositivo, puede actuar como **emisor** (muestra la secuencia de QR de un archivo) o como **receptor** (la lee con la cámara, reconstruye el archivo y verifica su integridad). Guarda en un historial local los archivos enviados y recibidos, y permite exportarlos y eliminarlos.

**Fuera de alcance (esta versión):**

- Cifrado de los datos transmitidos o almacenados, corrección de errores del protocolo, QR dinámicos, confirmaciones bidireccionales, reintentos selectivos: son evolución futura (ver 2.6).
- Transferir varios archivos en una misma transferencia.
- Reintentos selectivos con confirmación entre dispositivos (RF-07 del requerimiento original): en esta versión la recuperación ante pérdida se resuelve con el bucle del emisor (FR-006) y la posibilidad de seguir escaneando (FR-021). El criterio AC-05 del requerimiento original («cuando termina la secuencia, detectar que está incompleta») se cumple cuando el usuario termina la lectura con faltantes (FR-013).
- Cuentas de usuario, servidores, Bluetooth, Wi-Fi Direct o cualquier canal distinto de cámara y pantalla.
- Guardar archivos en carpetas del sistema elegidas por el usuario (se decidió el almacenamiento privado de la aplicación con exportación manual).
- Decisiones de diseño del protocolo (algoritmo de fragmentación, formato del payload, sincronización, regla de velocidad): el spike WI-002 validó el enfoque (viable con trabajo) y el WI-001 fue no concluyente; lo que queda abierto se resuelve en las tareas de las historias (ver 2.5).
- Garantía de funcionamiento en Safari (iOS incluido), Firefox u otros navegadores distintos de Chrome en Android (ver NFR-008).

### 1.3 Definiciones, acrónimos y abreviaturas

- **Emisor:** dispositivo que muestra la secuencia de QR.
- **Receptor:** dispositivo que lee la secuencia con la cámara.
- **Fragmento:** porción del archivo (con sus metadatos) codificada en un QR.
- **Vuelta:** una pasada completa de la secuencia de QR; el emisor la repite en bucle.
- **Almacenamiento privado de la app:** espacio de almacenamiento del navegador accesible solo para la aplicación.
- **PWA:** aplicación web instalable que funciona sin conexión tras su primera carga.

### 1.4 Referencias

- Requerimiento original: [`references/raw-requirement.md`](references/raw-requirement.md).
- Proyecto base: [angular-base](https://github.com/juanca202/angular-base).
- Decisiones posteriores a las pruebas con dispositivos: [raw-requirement-03](references/raw-requirement-03-decisiones-pruebas-con-dispositivos.md) y [raw-requirement-04](references/raw-requirement-04-decisiones-lectura-zxing.md).
- Hallazgos de los spikes: [raw-requirement-02](references/raw-requirement-02-hallazgos-spike-wi-002.md); informes [WI-002](../../../archived/work-items/WI-002-spike-medicion-qr-android/spike-report.md) y [WI-001](../../../archived/work-items/WI-001-spike-protocolo-transferencia-qr/spike-report.md).

## 2. Descripción general del producto

### 2.1 Perspectiva del producto

Producto nuevo e independiente. No se integra con otros sistemas ni requiere servidor: el único canal entre los dos dispositivos es óptico (pantalla del emisor → cámara del receptor). Parte del proyecto angular-base, ya adoptado como base de este repositorio.

### 2.2 Funciones del producto

- Elegir un archivo y emitirlo como secuencia de QR en bucle, mostrando su información y tiempo estimado.
- Recibir con la cámara, sin fotos manuales, tolerando duplicados, desorden y lecturas corruptas.
- Mostrar progreso de recepción, verificar integridad y guardar el archivo.
- Previsualizar el archivo recibido y abrirlo.
- Mantener un historial de enviados y recibidos con filtros, exportación y eliminación.

### 2.3 Restricciones del producto

- Debe funcionar sin conexión a Internet y sin servidor intermediario (tras la primera carga de la aplicación).
- Los datos viajan íntegramente dentro de los QR.
- El emisor no recibe información del receptor (no hay canal de retorno); el progreso solo existe en el receptor.
- La implementación se hace en este repositorio, que ya parte del proyecto base angular-base (ver sección 4); el stack Angular es una restricción impuesta por el equipo.
- Los datos persistentes se guardan solo en el almacenamiento privado de la aplicación (decisión del usuario, ver NFR-004).
- El protocolo se mantiene separado de la interfaz y del mecanismo de captura o visualización de QR, con versión de formato (requerimiento original, ver NFR-005).
- Sin límite fijo de tamaño de archivo (más allá del máximo de fragmentos del protocolo, FR-024): solo el aviso de tiempo estimado y un error si no cabe en el almacenamiento disponible o si requiere más fragmentos de los que admite el protocolo (FR-024).
- Fragmento por defecto de 1600 B por QR con corrección de errores de nivel M, con el QR mostrado lo más grande que permite la pantalla, y velocidad por defecto de 8 QR por segundo (decisión del usuario tras las pruebas con dispositivos; el spike solo validó 400 B, ver FR-003, FR-031, FR-032 y R-10).
- Un solo QR en pantalla a la vez y uno por cuadro en la lectura (FR-035 retirado).
- La lectura de QR se implementa solo con `zxing-wasm` (WebAssembly), servido con la aplicación: NO se usan `BarcodeDetector` ni `jsQR` (NFR-012, NFR-013).

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
| Funcionamiento offline (PWA) | Ya existe / se reutiliza: el proyecto base incluye service worker | Proyecto base angular-base |

- Idioma de la interfaz: español. No se definen requisitos de accesibilidad específicos en esta versión.
- Se asume que el usuario puede cargar la aplicación una vez con red en cada dispositivo antes de usarla sin conexión.
- **Spikes completados** ([WI-001](../../../archived/work-items/WI-001-spike-protocolo-transferencia-qr/spike-report.md), no concluyente; [WI-002](../../../archived/work-items/WI-002-spike-medicion-qr-android/spike-report.md), viable con trabajo): validaron la lectura de QR de 400 B con corrección M en Chrome 154 sobre Android 10 (10 de 10) y aportaron los NFR de rendimiento y compatibilidad (NFR-008 a NFR-011). **Sin validar con cámara real:** transferencia completa de 1 MB, funcionamiento sin red con la app instalada y elección de transferencia con una secuencia ajena; se verifican en las historias.
- **Lagunas que se resuelven en las tareas** (no bloquean el SRS): regla de velocidad automática, tamaño de fragmento mayor de 400 B, estrategia de actualización del service worker (NFR-011), y límite de fragmentos (FR-024).

### 2.6 Requisitos diferidos a futuras versiones

| Requisito | Motivo del diferimiento | Versión objetivo |
| --------- | ------------------------- | ------------------ |
| Cifrado de transmisión y de datos almacenados | Evolución prevista en el requerimiento original | Por definir |
| Corrección de errores | Evolución prevista; el protocolo debe permitirla (NFR-005). La compresión ya no se difiere: entra en esta versión (FR-030) | Por definir |
| QR dinámicos, confirmaciones bidireccionales y reintentos selectivos | Evolución prevista | Por definir |
| Velocidad y tamaño de fragmento configurables | Ya elegibles por el usuario en el emisor: velocidad (FR-031) y tamaño de fragmento o densidad (FR-032) | Resuelto |
| Corrección de errores o códigos de fuente (fountain) | Es la mejora de mayor efecto sobre el tiempo de transferencia (spike WI-002); se difiere por decisión del equipo; si se adopta, ADR y cambio de este SRS | Por definir |
| Varios QR a la vez (dos QR en pantalla y lectura de dos por cuadro) | Probado y descartado: no funcionó en las pruebas con dispositivos (FR-035 retirado; [insumo 04](references/raw-requirement-04-decisiones-lectura-zxing.md)) | Descartado |
| Compatibilidad garantizada con Safari/iOS y Firefox | Solo se probó Chrome en Android (NFR-008) | Por definir |

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
| Librerías de QR | `qrcode` (generación) y `zxing-wasm` (lectura de los bytes, única vía de lectura, con su `.wasm` servido con la aplicación) | `jsQR` y `BarcodeDetector` quedan descartados: en el móvil de pruebas `BarcodeDetector` falla siempre con `Barcode detection service unavailable` y con carga binaria devolvía el texto vacío; `jsQR` leía 13 QR de 651 cuadros; `zxing-wasm` funcionó bien (NFR-012, NFR-013; [insumo 04](references/raw-requirement-04-decisiones-lectura-zxing.md)) |

**Decisiones pendientes:** Ninguna a nivel de stack. Las lagunas de diseño del protocolo se resuelven en las tareas (ver 2.5).

## 4. Repositorios e implementación

| Repositorio | Tipo | Proyecto base | Notas |
| ----------- | ---- | -------------- | ----- |
| laboratorio-1 | Existente (con cambios) | No aplica | Este repositorio, ya basado en [angular-base](https://github.com/juanca202/angular-base); aplicación web única (emisor y receptor en la misma app) |

## 5. Requisitos funcionales

| ID | Categoría | Prioridad | Estado | Enunciado |
| -- | --------- | --------- | ------ | --------- |
| FR-001 | Interacción de usuario | Esencial | Aprobado | Al pulsar «Enviar», el sistema DEBE abrir el selector de archivos del dispositivo y permitir elegir un solo archivo de cualquier tipo por transferencia; si el usuario cierra el selector sin elegir, el sistema NO DEBE iniciar ninguna transferencia. |
| FR-002 | Salidas del sistema | Alta | Aprobado | Al elegir el archivo, el sistema DEBE mostrar la secuencia de QR y, debajo, el nombre, tipo y tamaño del archivo, la cantidad total de QR y el tiempo estimado por vuelta, sin mostrar progreso de transmisión; el tiempo estimado por vuelta se muestra desde el inicio (cantidad de QR × duración de cada QR). |
| FR-003 | Procesamiento de datos | Esencial | Aprobado | El sistema DEBE dividir el archivo en fragmentos aptos para un QR, cada uno con identificador de transferencia, posición, número total de fragmentos, verificación de integridad propia y su contenido; por defecto, 1600 B de datos por QR (configurable, FR-032) con corrección de errores de nivel M; el primer fragmento DEBE llevar los metadatos del archivo (FR-004) y, a continuación, los primeros datos hasta llenar su capacidad, para no desperdiciar un QR; y el emisor DEBE mostrar el QR lo más grande que permita la pantalla sin desbordarla, con un número entero de píxeles del dispositivo por módulo (sin escalado que deforme los módulos), para que sigan siendo legibles con fragmentos mayores. El spike solo validó 400 B (10 lecturas de 10 a unos 30 cm); el tamaño por defecto de 1600 B es una decisión del usuario, pendiente de validar con una serie de 10 lecturas secuenciales a unos 30 cm con al menos 9 aciertos (R-10). |
| FR-004 | Procesamiento de datos | Esencial | Aprobado | El sistema DEBE transmitir el nombre, el tipo, el tamaño original, el tamaño transmitido, la codificación de los datos y el hash SHA-256 del archivo original junto con su contenido para que el receptor los recupere y verifique. |
| FR-005 | Salidas del sistema | Esencial | Aprobado | Al elegir el archivo, el emisor DEBE mostrar el primer QR fijo, sin avanzar, hasta que el usuario lo toque (FR-026); desde ese primer toque DEBE mostrar los QR de forma secuencial con una velocidad de cambio que parte de un valor por defecto (8 QR por segundo) y que el usuario puede cambiar (FR-031), sin más intervención del usuario. |
| FR-006 | Flujos de proceso | Esencial | Aprobado | El emisor DEBE repetir la secuencia de QR en bucle hasta que su usuario cancele. |
| FR-007 | Interacción de usuario | Esencial | Aprobado | Al pulsar «Recibir», el sistema DEBE activar la cámara y leer automáticamente el QR de cada cuadro (uno por cuadro) sin que el usuario tome fotografías individuales; el receptor NO DEBE iniciar una lectura nueva mientras otra está en curso. |
| FR-008 | Procesamiento de datos | Esencial | Aprobado | El receptor DEBE tomar como transferencia activa la primera de la que lea sus metadatos y descartar los fragmentos de otra transferencia, los corruptos o inválidos y los de una versión de formato que no soporte; para cambiar de transferencia el usuario DEBE cancelar e iniciar de nuevo la recepción. La activación es automática, sin confirmación del usuario (FR-023). |
| FR-009 | Procesamiento de datos | Esencial | Aprobado | El receptor DEBE aceptar los fragmentos en cualquier orden y reordenarlos según su posición. |
| FR-010 | Procesamiento de datos | Esencial | Aprobado | El receptor DEBE ignorar los fragmentos que ya recibió, sin alterar el resultado. |
| FR-011 | Salidas del sistema | Alta | Aprobado | Durante la recepción, el sistema DEBE mostrar el nombre del archivo y, en una misma fila con reparto uniforme y en este orden, su tamaño total, el tiempo estimado restante y el porcentaje recibido; los fragmentos recibidos del total se muestran en la barra de fragmentos (FR-029), que es la única barra de la pantalla. |
| FR-012 | Procesamiento de datos | Esencial | Aprobado | Al tener todos los fragmentos, el receptor DEBE reconstruir el archivo y verificar su integridad automáticamente, sin acción del usuario, y liberar la cámara; solo entonces DEBE considerar la transferencia completada. |
| FR-013 | Salidas del sistema | Esencial | Aprobado | El receptor DEBE informar el resultado de la transferencia: **completada** (todos los fragmentos recibidos y verificación de integridad satisfactoria); **incompleta** (el usuario termina la lectura con el botón «Terminar lectura» y faltan fragmentos); **datos inválidos** (todos los fragmentos recibidos pero la verificación de integridad falla); **no reconstruible** (no se puede ensamblar el archivo, por ejemplo por metadatos inconsistentes); **almacenamiento lleno** (la recepción está completa y verificada, pero la cuota se agota al guardar: el sistema NO DEBE guardar ni registrar el archivo y DEBE ofrecer descargarlo en ese momento). |
| FR-014 | Casos de uso | Esencial | Aprobado | El usuario DEBE poder cancelar en cualquier momento, tanto en el emisor como en el receptor; la cancelación DEBE detener el proceso local, descartar los datos parciales y liberar sus recursos, incluida la cámara, sin pedir confirmación. La copia del archivo ya guardada por el emisor (FR-018) se conserva. |
| FR-015 | Procesamiento de datos | Esencial | Aprobado | Al completarse una recepción, el sistema DEBE guardar el archivo con su nombre y tipo originales en el almacenamiento privado de la aplicación, sin solicitar permisos de carpeta; un archivo con el mismo nombre que otro existente NO DEBE sobrescribirlo. |
| FR-016 | Salidas del sistema | Esencial | Aprobado | El sistema DEBE mostrar un historial de transferencias (enviadas y recibidas) con su contenido, ordenado del más reciente al más antiguo, con filtro Todos / Recibidos / Enviados, y permitir exportar cada archivo con su nombre original (descarga o compartir con otras aplicaciones del dispositivo). |
| FR-017 | Casos de uso | Esencial | Aprobado | El sistema DEBE permitir transferir archivos de tamaño superior al que cabe en un único QR, usando múltiples QR. |
| FR-018 | Procesamiento de datos | Alta | Aprobado | Al iniciar el envío de un archivo, el sistema DEBE guardar una copia en el almacenamiento privado de la aplicación para que figure en el historial como «enviado» con la fecha de inicio del envío (el emisor no sabe si el receptor lo recibió); enviar de nuevo el mismo archivo crea una entrada nueva. |
| FR-019 | Casos de uso | Alta | Aprobado | El usuario DEBE poder eliminar archivos del historial, previa confirmación, para liberar el espacio que ocupan. |
| FR-020 | Interacción de usuario | Alta | Aprobado | Al completarse una recepción, el receptor DEBE detener la lectura y mostrar un mensaje de éxito («archivo recibido correctamente», con su nombre y tamaño) con las acciones «Ver archivo» (lo muestra si el tipo se puede visualizar y, en otro caso, lo descarga) y «Descargar»; además DEBE mostrar una previsualización del archivo (la imagen si lo es; en otro caso, un icono de archivo con su nombre) y abrir el archivo al hacer clic en ella (mostrándolo si el tipo se puede visualizar y, en otro caso, descargándolo), con el historial directamente debajo. |
| FR-021 | Flujos de proceso | Alta | Aprobado | Tras un resultado «incompleta», el receptor DEBE permitir seguir escaneando (reactivando la cámara) conservando los fragmentos válidos ya recibidos; tras «datos inválidos», «no reconstruible» o «almacenamiento lleno» DEBE permitir reintentar desde cero. Los fragmentos parciales solo permanecen en memoria mientras el usuario esté en el flujo de recepción (incluida la pantalla de resultado) y NO DEBEN persistirse: salir del flujo o recargar los descarta. |
| FR-022 | Salidas del sistema | Alta | Aprobado | El sistema DEBE informar con un aviso en la pantalla donde ocurra, sin iniciar la transferencia, cuando: no haya cámara, el usuario deniegue el permiso de cámara, el archivo esté vacío o no quepa en el almacenamiento disponible, falle la copia local del envío por cuota agotada (FR-018, el envío NO DEBE iniciarse), la cuota de almacenamiento se agote al guardar una recepción (resultado «almacenamiento lleno» de FR-013), o el navegador no sea compatible. Las recepciones fallidas NO DEBEN registrarse en el historial. El texto exacto de los avisos se define en la implementación. |
| FR-023 | Flujos de proceso | Esencial | Aprobado | El receptor DEBE activar por sí mismo, sin pedir confirmación al usuario, la primera transferencia de la que lea los metadatos, mostrar de inmediato su nombre, tamaño y avance, e ignorar los fragmentos de las demás transferencias durante el resto de esa recepción; las transferencias leídas antes de esa activación y distintas de ella se descartan. Al recibir todos los fragmentos de la transferencia activa, el receptor DEBE reconstruirla, verificarla y guardarla sin intervención del usuario. Si el usuario descubre que se activó una transferencia ajena, DEBE poder cancelar e iniciar una recepción nueva (FR-008, FR-014). |
| FR-024 | Salidas del sistema | Alta | Aprobado | El sistema DEBE informar con un mensaje claro, sin iniciar la transferencia, cuando el archivo requiera más fragmentos de los que admite el protocolo. |
| FR-025 | Procesamiento de datos | Media | Aprobado | Al guardar un archivo recibido, el sistema DEBERÍA solicitar almacenamiento persistente para reducir el riesgo de que el navegador lo borre. |
| FR-026 | Interacción de usuario | Media | Aprobado | El primer toque sobre el código QR en pantalla DEBE iniciar la secuencia y, en cualquier toque posterior, el emisor DEBE reiniciar la vuelta: en ambos casos DEBE mostrar el primer QR, mantenerlo durante unos 3 segundos para que el receptor pueda capturarlo y después continuar la secuencia con la velocidad normal (FR-005). Mientras espera el primer toque, el emisor DEBE indicar que hay que tocar el QR para iniciar. |
| FR-027 | Salidas del sistema | Baja | Aprobado | Al abrir la pantalla de recepción con el parámetro `?debug`, el receptor DEBERÍA mostrar contadores de cada etapa de la lectura (cuadros procesados, QR vistos, QR leídos con su tamaño en bytes, fragmentos válidos, tamaño del vídeo y último error) para diagnosticar una lectura que no avanza; sin ese parámetro NO DEBE mostrarlos. |
| FR-028 | Interacción de usuario | Alta | Aprobado | El emisor DEBE mostrar bajo el QR una barra horizontal que represente el orden de los QR de la vuelta, con una marca vertical que indique cuál se está mostrando, y el número de QR actual y total. El usuario DEBE poder tocar o arrastrar la barra (o usar el teclado) para elegir un QR: el emisor DEBE mostrarlo, retenerlo unos 3 segundos y continuar la secuencia desde ahí con la velocidad normal, aun si aún esperaba el primer toque (FR-026). |
| FR-029 | Salidas del sistema | Alta | Aprobado | El receptor DEBE mostrar una barra horizontal con el mismo orden que la del emisor en la que se distingan los QR ya recibidos de los que faltan, para que el usuario sepa en qué tramo de la secuencia debe buscar y pueda elegirlo en la barra del emisor (FR-028). |
| FR-030 | Procesamiento de datos | Alta | Aprobado | El emisor DEBE comprimir el contenido del archivo (deflate, con las funciones nativas del navegador) antes de fragmentarlo cuando eso lo haga más pequeño, para transmitir menos QR; si no se comprime (no reduce el tamaño, el archivo está vacío o el navegador no puede), DEBE transmitirlo tal cual. El hash de integridad DEBE ser el del archivo original. El receptor DEBE descomprimir el contenido, comprobar que su tamaño y su hash coinciden con los anunciados y entregar el archivo original, sin intervención del usuario; si los datos comprimidos son inválidos o se expanden más allá del tamaño anunciado, DEBE terminar como «no reconstruible». El emisor DEBE indicar, cuando comprime, el tamaño que se transmite. El número de QR se calcula sobre el contenido transmitido. |
| FR-031 | Interacción de usuario | Alta | Aprobado | El emisor DEBE ofrecer elegir la velocidad de la secuencia entre 4, 6, 8, 10 y 12 QR por segundo (8 por defecto); al cambiarla con la secuencia en marcha, el QR en pantalla y su retención (FR-026) se mantienen, el siguiente llega con el nuevo intervalo y el tiempo estimado por vuelta se recalcula; la elección DEBE recordarse en el almacenamiento local del navegador y recuperarse al volver a cargar la página (FR-033). La velocidad adecuada depende de los cuadros por segundo que procese el receptor (lo orienta el panel de FR-027). |
| FR-032 | Interacción de usuario | Alta | Aprobado | El emisor DEBE ofrecer elegir el tamaño de fragmento (densidad) entre 200, 400, 800, 1200 y 1600 B de archivo por QR (1600 por defecto). Al cambiarlo, el emisor DEBE volver a fragmentar el archivo, que pasa a ser una transferencia nueva (otros fragmentos e identificador): DEBE actualizar la cantidad de QR y el tiempo por vuelta, volver a esperar el primer toque (FR-005), conservar la velocidad elegida (FR-031), recordar la nueva densidad (FR-033) y no volver a guardar la copia del archivo (FR-018); y DEBE avisar de que el receptor debe empezar de nuevo. Si el nuevo tamaño no es viable (el nombre del archivo no cabe en un fragmento tan pequeño, o el archivo necesitaría más fragmentos de los que admite el protocolo), DEBE avisar y conservar la transferencia y el tamaño actuales. |
| FR-033 | Interacción de usuario | Alta | Aprobado | El emisor DEBE recordar, en el almacenamiento local del navegador, la velocidad (FR-031) y la densidad (FR-032) que el usuario eligió y aplicarlas al volver a cargar la página, de modo que los selectores aparezcan con esos valores y el archivo se fragmente con la densidad recordada. Solo se guardan valores de las opciones vigentes: un valor guardado que ya no sea una opción (alterado o de una versión anterior) se ignora y se usa el de por defecto; una densidad que no se pudo aplicar (FR-032) no se guarda; y un almacenamiento no disponible (modo privado, cuota) NO DEBE interrumpir el envío. La preferencia no incluye ningún dato del archivo (NFR-001, NFR-004). |
| FR-034 | Salidas del sistema | Alta | Aprobado | Mientras dure una transferencia (el emisor mostrando la secuencia, el receptor abriendo la cámara y leyendo hasta tener un resultado), el sistema DEBERÍA mantener la pantalla encendida con la función de bloqueo de pantalla del navegador (Screen Wake Lock), para que ni se atenúe o apague la pantalla del emisor ni el receptor pierda la imagen de la cámara; DEBE volver a pedirla al recuperar la visibilidad de la pestaña mientras siga haciendo falta, liberarla al terminar, cancelar o salir de la pantalla, y seguir funcionando sin ella si el navegador no la ofrece o la rechaza. |
| FR-035 | Salidas del sistema | Alta | Retirado | **Retirado (2026-10-09, [insumo 04](references/raw-requirement-04-decisiones-lectura-zxing.md)).** Mostrar dos QR a la vez (opción «QR a la vez») y leer varios QR en un mismo cuadro no funcionó en las pruebas con dispositivos: el emisor DEBE mostrar siempre un solo QR y el receptor DEBE leer un QR por cuadro. Se eliminan la opción «QR a la vez», la segunda marca de la barra de posición y su preferencia recordada. |
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

**Origen de NFR-012 (nueva redacción) y NFR-013:** [insumo 04](references/raw-requirement-04-decisiones-lectura-zxing.md). **Origen de NFR-008 a NFR-011:** propuestos por el spike WI-002 y decididos por el usuario (compatibilidad solo Chrome en Android; 1 MB en 15 min como objetivo). **Origen de NFR-012, FR-026 y FR-027:** pruebas con dispositivos reales ([insumo 03](references/raw-requirement-03-decisiones-pruebas-con-dispositivos.md)). **Portabilidad** queda cubierta por NFR-006 (pantallas) y NFR-008 (navegadores).

## 7. Reglas de negocio

- **BR-01:** Una transferencia DEBE incluir exactamente un archivo. → relacionado con FR-001
- **BR-02:** Una transferencia DEBE considerarse completada solo si la verificación de integridad es satisfactoria. → relacionado con FR-012, FR-013
- **BR-03:** Si la verificación falla o faltan fragmentos, el sistema NO DEBE guardar el archivo recibido ni registrarlo en el historial. → relacionado con FR-013, FR-015, FR-022

## 8. Interfaces externas

### 8.1 Interfaces de usuario

- Aplicación web responsiva (móvil en retrato y escritorio); pantalla de inicio sencilla con dos acciones principales, Enviar y Recibir, y el historial debajo (ver sección 11).

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

No aplica: no se identificó normativa específica y los datos se procesan solo en los dispositivos del usuario (NFR-001). Si se maneja información sujeta a protección de datos personales, el cifrado diferido (sección 2.6) es una mitigación pendiente (ver R-03).

## 11. Diseño de interfaz (wireframes)

<!-- srs:ui-required=true -->
**¿Requiere diseño de interfaz?** Sí

**Tipo de solución:** Aplicación web

**¿Debe ser responsiva (adaptable a distintos tamaños de pantalla)?** Sí

| Pantalla | Wireframe | Estado de revisión | Observaciones ya incorporadas |
| -------- | --------- | --------------------- | -------------------------------- |
| Inicio e historial | [WF-001](wireframes/WF-001-inicio-historial.md) | Aprobado | Interfaz sencilla: dos botones con icono (Enviar / Recibir) y el historial debajo con filtros (FR-001, FR-007, FR-016, FR-019); variante móvil añadida (NFR-006). |
| Enviar: QR e información | [WF-002](wireframes/WF-002-enviar-seleccion.md) | Aprobado | Selectores de densidad y de velocidad bajo la barra de posición (FR-031, FR-032). Enviar abre el selector; al elegir se muestra solo el QR (fijo, el primero) y la información del archivo, sin progreso porque el emisor no sabe cuánto recibió el otro (FR-002, FR-006, FR-014); el QR es pulsable: el primer toque inicia la secuencia y los siguientes reinician la vuelta, reteniendo el primero unos 3 s (FR-005, FR-026). Bajo el QR, barra con marca de posición, interactiva, para continuar desde otro QR (FR-028). Reemplaza la pantalla de transmisión previa (el identificador WF-003 se retiró y no se reutiliza). |
| Recibir: escaneo e información | [WF-004](wireframes/WF-004-recibir-escaneo.md) | Aprobado | Sin aviso de confirmación: la transferencia se activa sola al leer sus metadatos (FR-023); cámara sin marco fijo: el recuadro se dibuja sobre el QR solo mientras se detecta (FR-036); panel de diagnóstico solo con `?debug` (FR-027). Cámara arriba; fila con peso, tiempo y porcentaje, y bajo ella la única barra, la de QR recibidos y faltantes (FR-029); abajo tamaño total, tiempo estimado y barra de progreso con porcentaje (FR-011); botón «Terminar lectura» para declarar «incompleta» (FR-013). |
| Resultado y previsualización | [WF-005](wireframes/WF-005-resultado-recepcion.md) | Aprobado | Variante «almacenamiento lleno» con opción de descargar (FR-013, FR-022).  Al terminar: previsualización (imagen o icono con nombre; clic abre el archivo) y el historial debajo (FR-020); variantes de error incluidas (Seguir escaneando / Reintentar, FR-021). Los valores de los wireframes (412 QR, tiempos) son solo ejemplos. |

**Navegación y comportamientos por defecto**

| Desde | Acción | Destino / comportamiento |
| ----- | ------ | ------------------------ |
| WF-001 | Enviar → elegir archivo | WF-002 con el QR en bucle; cerrar el selector sin elegir deja en WF-001 |
| WF-001 | Recibir | WF-004 con la cámara activa |
| WF-002 / WF-004 | Cancelar | Vuelve a WF-001; descarta lo parcial (el emisor conserva la copia ya guardada) |
| WF-002 | Elegir archivo | Muestra el primer QR fijo, sin avanzar, y la información del archivo (FR-005) |
| WF-002 | Tocar o arrastrar la barra | Muestra el QR elegido, lo retiene unos 3 s y continúa desde él (FR-028) |
| WF-002 | Tocar el QR | El primer toque inicia la secuencia y los siguientes reinician la vuelta: muestra el primer QR unos 3 s y sigue con la cadencia normal (FR-026) |
| WF-004 | Terminar lectura | Con la transferencia activa y fragmentos faltantes, WF-005 en «incompleta»; si aún no se leyeron los metadatos de ninguna transferencia, equivale a Cancelar |
| WF-004 | Metadatos leídos | La transferencia se activa sola y se muestran su nombre, tamaño y avance, sin pedir confirmación (FR-023) |
| WF-004 | Recepción completa | WF-005 en «completada», sin acción del usuario |
| WF-005 | Seguir escaneando | WF-004 con la cámara activa y los fragmentos válidos conservados |
| WF-005 | Reintentar | WF-004 desde cero |
| WF-001 / WF-005 | Historial | Filtro «Todos» por defecto; eliminar pide confirmación (FR-019); los avisos de FR-022 se muestran en la pantalla donde ocurre el caso |

## 12. Verificación y trazabilidad

| ID | Origen | Depende de | Método de verificación | Criterio de verificación |
| -- | ------ | ----------- | -------------------------- | --------------------------- |
| FR-001 | [RF-01](references/raw-requirement.md); wireframes | Ninguna | Demostración | Al pulsar Enviar se abre el selector y solo permite elegir un archivo de cualquier tipo; cerrarlo sin elegir no inicia nada. |
| FR-002 | Revisión de wireframes | FR-001 | Inspección | Con el QR visibles nombre, tipo, tamaño, cantidad de QR y tiempo estimado por vuelta; sin barra de avance. |
| FR-003 | [RF-02](references/raw-requirement.md); spike WI-002 | Ninguna | Prueba | Cada fragmento decodificado contiene identificador de transferencia, posición, total, verificación propia y contenido; el primer fragmento lleva además los metadatos y se llena con los primeros datos (sin dejar espacio sin usar); por defecto el fragmento es de 1600 B con corrección M y el QR se dibuja tan grande como permite la pantalla (hasta 40 rem y el 70 % del alto); la serie de 10 lecturas secuenciales a unos 30 cm con al menos 9 aciertos queda pendiente de validación con cámara real. |
| FR-004 | Respuestas del usuario (almacenamiento y recepción); [spike WI-002](../../../archived/work-items/WI-002-spike-medicion-qr-android/spike-report.md) | FR-003 | Prueba | El nombre, el tipo y el hash SHA-256 se recuperan idénticos en el receptor. |
| FR-005 | [RF-03](references/raw-requirement.md); respuesta del usuario (velocidad automática); decisión del usuario tras las pruebas con dispositivos (inicio con el primer toque) | FR-003 | Prueba | El primer QR queda fijo hasta el primer toque; desde él la velocidad se fija sin más intervención del usuario y una transferencia completa se logra en el entorno de referencia definido por el spike. |
| FR-006 | [RF-07](references/raw-requirement.md) (sustituido en parte por el bucle); respuesta del usuario | FR-005 | Prueba | Tras tres vueltas completas sin cancelar, el emisor sigue mostrando la secuencia; al cancelar se detiene. |
| FR-007 | [RF-04](references/raw-requirement.md); spike WI-002 (H-11) | Ninguna | Demostración | El receptor lee la secuencia sin que el usuario capture fotos y no lanza una lectura nueva mientras otra está en curso. |
| FR-008 | [RF-02](references/raw-requirement.md); restricciones del requerimiento | FR-003 | Prueba | Con fragmentos de otra transferencia, alterados o de versión desconocida mezclados, el archivo recibido no cambia y se rechazan; la transferencia activa es la primera cuyos metadatos se leyeron. |
| FR-009 | [RF-05](references/raw-requirement.md) | FR-003 | Prueba | Fragmentos entregados en orden aleatorio producen el mismo archivo. |
| FR-010 | [RF-06](references/raw-requirement.md) | FR-003 | Prueba | Fragmentos repetidos no cambian el resultado. |
| FR-011 | Revisión de wireframes | FR-007 | Inspección | Durante la recepción, en escritorio y móvil, se muestran el nombre y, en una fila repartida, tamaño total, tiempo estimado restante y porcentaje, en ese orden, sobre la única barra, la de fragmentos recibidos. |
| FR-012 | [RF-08](references/raw-requirement.md) | FR-009 | Prueba | Con todos los fragmentos leídos, la verificación y el resultado aparecen sin acción del usuario y la cámara se libera; el hash del archivo recibido coincide con el del original en el 100 % de las pruebas completadas. |
| FR-013 | [RF-09](references/raw-requirement.md); respuesta del usuario (terminar lectura) | FR-012 | Prueba | Se provocan los cinco resultados: completo → «completada»; «Terminar lectura» con faltantes → «incompleta»; alterar el contenido con todos los fragmentos → «datos inválidos»; metadatos inconsistentes → «no reconstruible»; cuota agotada al guardar → «almacenamiento lleno» con opción de descargar, sin entrada en el historial. Cada uno muestra su mensaje. |
| FR-014 | [RF-10](references/raw-requirement.md) | FR-018 | Prueba | Cancelar en emisor o receptor, sin confirmación, detiene el proceso, descarta datos parciales y libera la cámara; la copia ya guardada por el emisor permanece en el historial. |
| FR-015 | Respuestas del usuario (almacenamiento) | FR-012 | Prueba | El archivo recibido queda en el almacenamiento privado con su nombre y tipo originales sin que el navegador pida permiso de carpeta; dos recepciones con el mismo nombre quedan como dos entradas. |
| FR-016 | Respuestas del usuario (historial); revisión de wireframes | FR-015, FR-018 | Demostración | El historial lista recibidos y enviados del más reciente al más antiguo; cada filtro (Todos, Recibidos, Enviados) muestra solo lo que corresponde; cada archivo se exporta con su nombre original. |
| FR-017 | [RF-12](references/raw-requirement.md) | FR-003 | Prueba | Se transfiere con éxito un archivo mayor que la capacidad de un único QR (valor fijado por el spike). |
| FR-018 | Respuestas del usuario (historial de enviados con contenido) | FR-001 | Prueba | Al iniciar el envío, la copia del archivo figura en el historial. |
| FR-019 | Propuesta del agente confirmada por el usuario | FR-016 | Demostración | Al eliminar, tras confirmar, el archivo desaparece del historial y el espacio de almacenamiento usado disminuye en su tamaño. |
| FR-020 | Revisión de wireframes; decisión del usuario tras las pruebas con dispositivos | FR-015 | Demostración | Al completarse, se detiene la lectura y aparece el mensaje de éxito con «Ver archivo» y «Descargar»; una imagen se previsualiza; otro tipo muestra icono y nombre; el clic abre el archivo (lo muestra si se puede visualizar, lo descarga si no); el historial queda debajo. |
| FR-021 | Wireframe WF-005 y respuesta del usuario (terminar lectura) | FR-013 | Prueba | Tras «incompleta», seguir escaneando conserva los fragmentos ya válidos; tras los otros errores, reintentar empieza de cero; al recargar o salir del flujo no queda ningún fragmento almacenado. |
| FR-022 | Validación externa de Ola 3 | FR-001, FR-007, FR-015 | Prueba | Sin cámara o permiso, archivo vacío o que no cabe, cuota agotada o navegador incompatible: se muestra el mensaje y no se inicia; una recepción fallida no aparece en el historial. |
| FR-023 | Spike WI-002 (H-01, H-09); US-002; decisión del usuario tras las pruebas con dispositivos (2026-10-08) | FR-008 | Prueba | Sin pedir confirmación, el receptor activa la primera transferencia cuyos metadatos lee, muestra su nombre, tamaño y avance e ignora los fragmentos de otra en cuadro; al recibir todos los fragmentos reconstruye, verifica y guarda sin que el usuario pulse nada, y el archivo guardado es el de la transferencia activa. |
| FR-024 | Spike WI-002 (H-03); US-001 | FR-003 | Prueba | Un archivo que exige más fragmentos de los admitidos muestra el mensaje y no inicia la transferencia. |
| FR-025 | Spike WI-002 (H-12); US-002 | FR-015 | Inspección | Al guardar una recepción se solicita almacenamiento persistente; su resultado es observable en el navegador. |
| FR-026 | Pruebas con dispositivos reales (2026-10-08); decisión del usuario | FR-006 | Prueba | Sin tocar, el primer QR no cambia; el primer toque inicia la secuencia mostrando el primer QR unos 3 s y luego continúa a la velocidad normal; un toque posterior reinicia la vuelta (cuenta de nuevo desde 1); sin emisión en curso el toque no hace nada. |
| FR-027 | Pruebas con dispositivos reales (2026-10-08) | FR-007 | Inspección | Con `?debug` la pantalla de recepción muestra los contadores (cuadros, QR vistos, leídos con su tamaño, fragmentos válidos, tamaño de vídeo, último error); sin el parámetro no aparecen. |
| FR-028 | Decisión del usuario tras las pruebas con dispositivos (2026-10-08) | FR-006, FR-026 | Prueba | La marca indica el QR en pantalla y avanza con la secuencia; tocar o arrastrar la barra (o usar el teclado) muestra ese QR, lo retiene unos 3 s y continúa desde él; funciona también antes del primer toque; la barra es operable con teclado y expone su posición a las tecnologías de apoyo. |
| FR-029 | Decisión del usuario tras las pruebas con dispositivos (2026-10-08) | FR-009, FR-028 | Prueba | Tras leer algunos QR, la barra del receptor pinta los recibidos y deja sin pintar los que faltan, con la misma ordenación que la barra del emisor; al recibir otro QR se actualiza. |
| FR-030 | Decisión del usuario tras las pruebas con dispositivos (2026-10-08) | FR-003, FR-004, NFR-003 | Prueba | Un archivo muy comprimible genera muchos menos QR que sin comprimir y el receptor lo entrega idéntico byte a byte; uno que no se comprime (datos aleatorios) viaja tal cual y sin indicar «comprimido»; datos comprimidos corruptos o que se expanden más de lo anunciado terminan como «no reconstruible»; el hash comprobado es el del original. |
| FR-031 | Decisión del usuario tras las pruebas con dispositivos (2026-10-08) | FR-005, FR-026 | Prueba | El selector ofrece 4, 6, 8, 10 y 12 QR por segundo con 8 por defecto; al cambiarlo en marcha se respeta la retención del QR elegido y el siguiente llega a la nueva cadencia; antes del primer toque solo recalcula el tiempo por vuelta; valores no válidos se ignoran. |
| FR-032 | Decisión del usuario tras las pruebas con dispositivos (2026-10-09) | FR-003, FR-005, FR-031 | Prueba | El selector ofrece 200, 400, 800, 1200 y 1600 B por QR con 1600 por defecto; al elegir otro cambian la cantidad de QR y el tiempo por vuelta, la secuencia espera de nuevo el primer toque, la velocidad y la copia guardada se conservan; con un nombre demasiado largo para 200 B o un archivo demasiado grande para ese tamaño se avisa y no cambia nada. |
| FR-033 | Decisión del usuario tras las pruebas con dispositivos (2026-10-09) | FR-031, FR-032, NFR-004 | Prueba | Se elige otra densidad y velocidad, se recarga la página y, al elegir un archivo, los selectores muestran lo elegido y el archivo se fragmenta con esa densidad; con valores guardados que no son opciones vigentes se usan los de por defecto; sin localStorage utilizable (o si lanza) el envío funciona con los de por defecto; no se guarda una densidad rechazada; solo se guardan los dos números. |
| FR-034 | Revisión final de la implementación (2026-10-09); spike WI-002 (`wakeLock` disponible) | FR-005, FR-007 | Prueba | Con transferencia en curso se pide el bloqueo; se libera al cancelar, al tener resultado y al salir; se vuelve a pedir al volver a ver la pestaña; sin la API o con rechazo no hay error ni se interrumpe la transferencia. |
| FR-035 | Decisión del usuario (2026-10-09); retirado tras las pruebas con dispositivos ([insumo 04](references/raw-requirement-04-decisiones-lectura-zxing.md)) | FR-005, FR-007, FR-028, FR-033 | Inspección | Retirado: el emisor no ofrece «QR a la vez», muestra siempre un QR y una sola marca en la barra de posición; el receptor lee un QR por cuadro. |
| FR-036 | Decisión del usuario (2026-10-09), [insumo 04](references/raw-requirement-04-decisiones-lectura-zxing.md) | FR-007 | Prueba | Sin QR en cuadro no se dibuja ningún recuadro; con un QR se dibuja sobre su posición (incluida la imagen recortada); si el QR se pierde unos cuadros el recuadro se mantiene hasta unos 0,4 s y después desaparece; al detener la lectura se borra. |
| NFR-001 | [RF-11](references/raw-requirement.md); restricciones | Ninguna | Prueba | Con el tráfico de red capturado, no hay ninguna petición durante el envío ni la recepción. |
| NFR-002 | Restricciones del requerimiento; respuesta del usuario (PWA) | Ninguna | Prueba | Tras la primera carga, la aplicación abre y transfiere sin red. |
| NFR-003 | [RF-08](references/raw-requirement.md) | FR-012 | Prueba | Comparación byte a byte del archivo recibido con el original, sin diferencias. |
| NFR-004 | Respuesta del usuario (almacenamiento) | FR-015 | Inspección | Revisión del código y de los permisos: solo hay lecturas y escrituras en el almacenamiento privado (archivos) y en el almacenamiento local (solo las preferencias numéricas de velocidad y densidad); la única salida de archivos es la exportación iniciada por el usuario. |
| NFR-005 | Consideraciones para el diseño del requerimiento | Ninguna | Inspección | El protocolo se ejecuta sin depender de UI ni de cámara, y el formato lleva número de versión. |
| NFR-006 | Respuesta del usuario (responsiva) | Ninguna | Demostración | Las cuatro pantallas y sus estados de error funcionan desde 360 px hasta 1280 px o más de ancho, sin desplazamiento horizontal. |
| NFR-007 | Propuesta del agente confirmada por el usuario | FR-020 | Prueba | Un SVG o HTML con script no ejecuta código al previsualizarse o abrirse. |
| NFR-008 | Spike WI-002; decisión del usuario; [insumo 04](references/raw-requirement-04-decisiones-lectura-zxing.md) | Ninguna | Prueba | Una transferencia completa se logra en Chrome para Android leyendo siempre con `zxing-wasm`, también cuando `BarcodeDetector` falla o no existe. |
| NFR-009 | Spike WI-002 (medido 10 de 10) | FR-007 | Prueba | Serie de 10 lecturas secuenciales de un QR de 400 B con corrección M a unos 30 cm, con al menos 9 aciertos. |
| NFR-010 | Spike WI-002 (H-14); decisión del usuario | FR-005, FR-017 | Prueba | Transferencias reales de 1 MB con hash idéntico; se registra el tiempo y se compara con 15 minutos (objetivo, no bloqueante). |
| NFR-011 | Spike WI-002 (H-13) | NFR-002 | Demostración | Tras desplegar una versión nueva, la aplicación instalada pasa a ella tras recargar, sin quedarse en la antigua. |
| NFR-012 | Pruebas con dispositivos reales (2026-10-08 y 2026-10-09); hallazgos: `BarcodeDetector` devuelve el texto vacío con carga binaria y falla con `Barcode detection service unavailable` | FR-007 | Prueba | Un QR con bytes de todos los valores se lee con los bytes idénticos usando solo `zxing-wasm`; el código del receptor no usa `BarcodeDetector` ni `jsQR`. |
| NFR-013 | Decisión del usuario (2026-10-09), [insumo 04](references/raw-requirement-04-decisiones-lectura-zxing.md) | FR-007, NFR-001, NFR-002 | Prueba | El `.wasm` del lector está entre los archivos precacheados por el service worker; una recepción completa sin conexión y sin peticiones de red lee los QR; el módulo se pide al abrir la recepción, no al leer el primer cuadro. |
| BR-01 a BR-03 | Requerimiento original y respuestas del usuario | FR-001, FR-012, FR-013, FR-015, FR-022 | Prueba | BR-01: no se puede elegir más de un archivo; BR-02: sin verificación satisfactoria no se declara «completada»; BR-03: tras un resultado de error no hay archivo guardado ni entrada en el historial. |

## 13. Riesgos

| ID | Riesgo | Probabilidad | Impacto | Mitigación | Relacionado con |
| -- | ------ | -------------- | ------- | ----------- | ------------------ |
| R-01 | Lectura inestable de QR (brillo, reflejos, velocidad) | Media | Alto | Fragmento de 400 B validado (10 de 10); el bucle da más oportunidades de lectura; regla de velocidad validada en las tareas | FR-005, FR-006, FR-007, NFR-009 |
| R-02 | El navegador limita o borra el almacenamiento privado | Media | Alto | Pedir almacenamiento persistente, avisar cuando se agote (FR-022) y permitir exportar | FR-015, FR-016, FR-018, FR-022 |
| R-03 | Archivos sin cifrar en el dispositivo (cifrado diferido) | Media | Medio | Eliminación fácil; cifrado como evolución futura | FR-019, sección 2.6 |
| R-04 | Cámara y modo offline dependen del navegador (contexto seguro, instalación); el modo sin red no se probó en el spike | Media | Alto | Compatibilidad limitada a Chrome en Android (NFR-008); prueba manual en modo avión en las historias | NFR-002, NFR-008, FR-007 |
| R-05 | El emisor no sabe si el receptor terminó y puede seguir indefinidamente | Media | Bajo | Cancelación manual disponible en todo momento (FR-014) | FR-006, FR-014 |
| R-06 | Archivos grandes con tiempos poco prácticos: con 400 B por QR, 1 MB son unos 2600 fragmentos y, con 90 % de lectura por vuelta, tarda unos 37 min a 5 fps (varias vueltas; modelo del spike) | Alta | Medio | Mostrar el tiempo estimado; NFR-010 como objetivo; fragmentos mayores validados o corrección de errores (diferida) | FR-002, FR-017, NFR-010 |
| R-07 | Abrir archivos recibidos de tipos arbitrarios | Media | Alto | NFR-007 y FR-020: visor aislado o descarga | FR-020, NFR-007 |
| R-08 | Una secuencia ajena delante puede dejar al receptor con el archivo equivocado (H-01 del spike); sin confirmación de nombre y tamaño el riesgo es aceptado por decisión del usuario | Media | Medio | El receptor muestra el nombre, tamaño y avance de la transferencia activa y el usuario puede cancelar e iniciar de nuevo (FR-008, FR-014, FR-023); prueba con cámara | FR-008, FR-014, FR-023 |
| R-09 | Fuera de Chrome en Android el funcionamiento no está probado (Safari/iOS, Firefox) | Alta | Medio | Alcance limitado por NFR-008; lectura con `zxing-wasm`, que no depende del navegador; ampliar compatibilidad en una versión futura | NFR-008 |
| R-10 | La lectura de QR de 1600 B (149 módulos por lado, mucho más densos que los 81 de 400 B que validó el spike) desde la pantalla de un laptop puede no ser estable en el móvil (módulos pequeños, brillo, reflejos); no hay serie validada con 1600 B ni lectura de extremo a extremo con cámara real tras las correcciones | Media | Alto | Panel de diagnóstico `?debug` (FR-027) para ubicar la etapa que falla; reinicio de la vuelta al tocar el QR (FR-026); si persiste, QR mostrado lo más grande posible en el emisor; si persiste, volver a 400 B (constante `DEFAULT_DATA_SIZE`) según los datos de cámara real | FR-003, FR-007, FR-026, FR-027, NFR-009, NFR-012 |
| R-11 | `BarcodeDetector` falla siempre en el móvil de pruebas y `jsQR` leía muy pocos QR (13 de 651 cuadros); el lector solo con `zxing-wasm` añade unos 940 KB de `.wasm` a la aplicación y su rendimiento con QR de 1600 B no está medido con cámara real | Media | Medio | Lectura solo con `zxing-wasm` (NFR-012), `.wasm` servido y precacheado con la aplicación (NFR-013), panel `?debug` para medir cuadros por segundo y lecturas (FR-027); si no es estable, reducir la densidad | FR-007, FR-027, NFR-012, NFR-013 |

## 14. Enlaces y archivos de apoyo

- **Requerimiento original:** [`references/raw-requirement.md`](references/raw-requirement.md)
- **Investigación de stack:** No aplica (stack decidido por el usuario).
- **Hallazgos de los spikes y decisiones:** [`references/raw-requirement-02-hallazgos-spike-wi-002.md`](references/raw-requirement-02-hallazgos-spike-wi-002.md)
- **Decisiones tras las pruebas con dispositivos:** [`references/raw-requirement-03-decisiones-pruebas-con-dispositivos.md`](references/raw-requirement-03-decisiones-pruebas-con-dispositivos.md)
- **Decisiones sobre la lectura con ZXing, un QR por cuadro y valores por defecto:** [`references/raw-requirement-04-decisiones-lectura-zxing.md`](references/raw-requirement-04-decisiones-lectura-zxing.md)
- **Spikes:** [WI-002](../../../archived/work-items/WI-002-spike-medicion-qr-android/spike-report.md) y [WI-001](../../../archived/work-items/WI-001-spike-protocolo-transferencia-qr/spike-report.md)
- **Wireframes:** [`wireframes/`](wireframes/) — detalle por pantalla en la sección 11.

## 15. Historias de usuario derivadas

| US-XXX | Título | FR-XXX cubiertos |
| ------ | ------ | ----------------- |
| [US-001](../../user-stories/US-001-enviar-archivo-qr/README.md) | Enviar un archivo como secuencia de QR | FR-001 a FR-006, FR-014, FR-017, FR-018, FR-022, FR-024, FR-026, FR-028, FR-030, FR-031, FR-032, FR-033, FR-034 |
| [US-002](../../user-stories/US-002-recibir-archivo-qr/README.md) | Recibir un archivo escaneando una secuencia de QR | FR-007 a FR-015, FR-020, FR-021, FR-022, FR-023, FR-025, FR-027, FR-029, FR-030, FR-034, FR-036 |
| [US-003](../../user-stories/US-003-historial-transferencias/README.md) | Consultar y gestionar el historial de transferencias | FR-016, FR-019 |

## Observaciones

- **Spikes incorporados (2026-10-08):** se añadieron FR-023 a FR-025 y NFR-008 a NFR-011, y se actualizaron FR-003, FR-004, FR-007, FR-008, el repositorio (laboratorio-1, existente) y los riesgos. Los nuevos requisitos se aprobaron con las prioridades propuestas y WF-004 se actualizó con el aviso de confirmación (FR-023). Quedan por validar con cámara real, en las historias: transferencia completa de 1 MB, modo sin red y elección entre transferencias.
- **Decisiones tras las pruebas con dispositivos (2026-10-08, [insumo 03](references/raw-requirement-03-decisiones-pruebas-con-dispositivos.md)):** se reescribió FR-023 (el receptor activa la primera transferencia con metadatos legibles sin pedir confirmación), se ajustaron FR-008, R-08 y WF-004 (sin aviso de confirmación) y se añadieron FR-026 (el primer toque en el QR inicia la secuencia y los siguientes reinician la vuelta, y la secuencia ya no arranca sola: se ajustaron FR-002 y FR-005; WF-002 actualizado), FR-027 (panel `?debug`), NFR-012 (bytes del QR sin alterar; stack: `jsQR` lee siempre) y R-10. **Pendiente de sincronizar en las historias** (no modificadas por ahora): [US-002](../../user-stories/US-002-recibir-archivo-qr/README.md) conserva los criterios y casos de prueba del paso de confirmar (AC-029, AC-030, AC-032 y TC-029, TC-030, TC-032, TC-033) que ya no aplican; [US-001](../../user-stories/US-001-enviar-archivo-qr/README.md) no tiene aún criterio para FR-026.
- **Lectura solo con ZXing, un QR por cuadro y valores por defecto (2026-10-09, [insumo 04](references/raw-requirement-04-decisiones-lectura-zxing.md)):** se retiró FR-035 (dos QR a la vez), se añadió FR-036 (recuadro sobre el QR detectado) y NFR-013 (el `.wasm` del lector se sirve con la aplicación y funciona sin conexión), se reescribieron NFR-008 y NFR-012 (la lectura se hace solo con `zxing-wasm`; `BarcodeDetector` y `jsQR` descartados) y FR-003, FR-007 y FR-032 (densidad por defecto de 1600 B; velocidad por defecto de 8 QR/s sin cambios), y se actualizaron el stack, 2.3, 2.5, 2.6, 8.3, la trazabilidad y los riesgos (R-09, R-10, nuevo R-11). Pendiente de actualizar a partir de este SRS: las historias US-001 y US-002 y sus tareas y casos de prueba, que aún reflejan el lector anterior y los valores de 800 B.
- **Ola 3 superada (2026-10-08):** tras cuatro rondas de validación externa que dejaron el documento «insuficiente» y sus hallazgos resueltos, la quinta (subagente sin contexto) dio «suficiente con reservas». Se cerraron los comportamientos de FR-013, FR-022 y FR-023 y los wireframes WF-004 y WF-005.
- **Lagunas delegadas a las tareas de las historias (decisión del usuario, 2026-10-08):** no bloquean este SRS; cada una se resuelve con un criterio verificable y su decisión se registra en el `progress.md` de la tarea.
  - Formato mínimo de fragmentos y metadatos (dónde viajan nombre, tipo y hash), límite de fragmentos (FR-024) y regla de velocidad automática (FR-005): tareas del protocolo y la emisión (US-001).
  - Fórmulas del tiempo estimado (FR-002, FR-011) y base del porcentaje (fragmentos o bytes); definición operativa de «unos 30 cm» y «entorno de referencia» (FR-005, NFR-009).
  - Campos del historial (FR-016), tipos previsualizables (FR-020), saneamiento de nombres y tratamiento de nombres duplicados al exportar (FR-015): tareas de la US-003 y de la recepción.
  - Sincronizar la lista de requisitos por pantalla entre la sección 11 y los documentos WF, y asignar los NFR a las historias en la sección 15.
  - Validar con cámara real, en las historias: transferencia completa de 1 MB, modo sin red y elección entre transferencias.

## Validación

### Definition of Ready (DoR)

| Criterio DoR | Estado | Notas |
| ------------ | ------ | ----- |
| Stack tecnológico resuelto | Cumple | Angular 22 sobre angular-base; sin backend |
| Repositorios y proyecto base definidos | Cumple | laboratorio-1, existente (ya basado en angular-base); proyecto base no aplica |
| Requisitos funcionales completos y priorizados | Cumple | FR-001 a FR-036 aprobados (FR-035 retirado) |
| Requisitos no funcionales revisados y priorizados | Cumple | NFR-001 a NFR-013 aprobados |
| Interfaces externas revisadas | Cumple | Usuario, hardware, software; comunicaciones no aplica |
| Requisitos de datos formalizados | Cumple | |
| Cumplimiento normativo trazado | Cumple | No aplica |
| Diseño de interfaz revisado | Cumple | 4 wireframes aprobados |
| Verificación y trazabilidad completas | Cumple | Incluye FR-023 a FR-036 y NFR-008 a NFR-013 |
| Riesgos identificados | Cumple | R-01 a R-11 |
| Alcance y fuera de alcance claros | Cumple | |
| Sin aclaraciones pendientes | Cumple | Las lagunas de detalle están delegadas a las tareas, registradas en Observaciones por decisión del usuario |
| Validación final (Ola 3) superada | Cumple | Quinta validación externa: «suficiente con reservas»; reservas delegadas |
