# SRS-001: Transferencia de archivos mediante secuencia de QR

<!-- srs:status=Ready -->
**Estado:** Ready
**Fecha de creación:** 2026-10-08
**Última actualización:** 2026-10-08

## 1. Introducción

### 1.1 Propósito

Permitir que una persona pase un archivo de un dispositivo a otro usando solo la pantalla de uno y la cámara del otro, mediante una secuencia de códigos QR, en entornos sin red o sin conectividad disponible. Lo usan tanto una persona que transfiere entre sus propios dispositivos como dos personas cara a cara.

### 1.2 Alcance del producto

Aplicación web responsiva e instalable (PWA) que, en un mismo dispositivo, puede actuar como **emisor** (muestra la secuencia de QR de un archivo) o como **receptor** (la lee con la cámara, reconstruye el archivo y verifica su integridad). Guarda en un historial local los archivos enviados y recibidos, y permite exportarlos y eliminarlos.

**Fuera de alcance (esta versión):**

- Cifrado de los datos transmitidos o almacenados, compresión y corrección de errores del protocolo, QR dinámicos, confirmaciones bidireccionales, reintentos selectivos y tamaños/velocidades de fragmento configurables: son evolución futura (ver 2.6).
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
- Fragmento por defecto de 400 B por QR con corrección de errores de nivel M (validado en el spike); un tamaño mayor solo se adopta tras una serie validada (ver FR-003).

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
- **Lagunas que se resuelven en las tareas** (no bloquean el SRS): regla de velocidad automática, tamaño de fragmento mayor de 400 B, estrategia de actualización del service worker (NFR-011), límite de fragmentos (FR-024) y lector de reserva.

### 2.6 Requisitos diferidos a futuras versiones

| Requisito | Motivo del diferimiento | Versión objetivo |
| --------- | ------------------------- | ------------------ |
| Cifrado de transmisión y de datos almacenados | Evolución prevista en el requerimiento original | Por definir |
| Compresión y corrección de errores | Evolución prevista; el protocolo debe permitirla (NFR-005) | Por definir |
| QR dinámicos, confirmaciones bidireccionales y reintentos selectivos | Evolución prevista | Por definir |
| Tamaño de fragmento y velocidad configurables | Evolución prevista; en esta versión la velocidad es automática | Por definir |
| Corrección de errores o códigos de fuente (fountain) | Es la mejora de mayor efecto sobre el tiempo de transferencia (spike WI-002); se difiere por decisión del equipo; si se adopta, ADR y cambio de este SRS | Por definir |
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
| Librerías de QR | `qrcode` (generación) y `jsQR` (lectura); `BarcodeDetector` opcional en Chromium | Confirmadas por el spike WI-002 con carga binaria |

**Decisiones pendientes:** Ninguna a nivel de stack. Las lagunas de diseño del protocolo se resuelven en las tareas (ver 2.5).

## 4. Repositorios e implementación

| Repositorio | Tipo | Proyecto base | Notas |
| ----------- | ---- | -------------- | ----- |
| laboratorio-1 | Existente (con cambios) | No aplica | Este repositorio, ya basado en [angular-base](https://github.com/juanca202/angular-base); aplicación web única (emisor y receptor en la misma app) |

## 5. Requisitos funcionales

| ID | Categoría | Prioridad | Estado | Enunciado |
| -- | --------- | --------- | ------ | --------- |
| FR-001 | Interacción de usuario | Esencial | Aprobado | Al pulsar «Enviar», el sistema DEBE abrir el selector de archivos del dispositivo y permitir elegir un solo archivo de cualquier tipo por transferencia; si el usuario cierra el selector sin elegir, el sistema NO DEBE iniciar ninguna transferencia. |
| FR-002 | Salidas del sistema | Alta | Aprobado | Al elegir el archivo, el sistema DEBE mostrar la secuencia de QR y, debajo, el nombre, tipo y tamaño del archivo, la cantidad total de QR y el tiempo estimado por vuelta, sin mostrar progreso de transmisión; el tiempo estimado se muestra como «calculando…» mientras no haya datos suficientes. |
| FR-003 | Procesamiento de datos | Esencial | Aprobado | El sistema DEBE dividir el archivo en fragmentos aptos para un QR, cada uno con identificador de transferencia, posición, número total de fragmentos, verificación de integridad propia y su contenido; por defecto, 400 B de datos por QR con corrección de errores de nivel M, y un tamaño mayor NO DEBE adoptarse por defecto sin una serie validada de 10 lecturas secuenciales a unos 30 cm con al menos 9 aciertos. |
| FR-004 | Procesamiento de datos | Esencial | Aprobado | El sistema DEBE transmitir el nombre, el tipo y el hash SHA-256 del archivo completo junto con su contenido para que el receptor los recupere y verifique. |
| FR-005 | Salidas del sistema | Esencial | Aprobado | El emisor DEBE mostrar los QR de forma secuencial con una velocidad de cambio determinada automáticamente, sin intervención del usuario. |
| FR-006 | Flujos de proceso | Esencial | Aprobado | El emisor DEBE repetir la secuencia de QR en bucle hasta que su usuario cancele. |
| FR-007 | Interacción de usuario | Esencial | Aprobado | Al pulsar «Recibir», el sistema DEBE activar la cámara y leer automáticamente los QR sin que el usuario tome fotografías individuales; el receptor NO DEBE iniciar una lectura nueva mientras otra está en curso. |
| FR-008 | Procesamiento de datos | Esencial | Aprobado | El receptor DEBE tomar como transferencia activa la del primer fragmento válido leído y descartar los fragmentos de otra transferencia, los corruptos o inválidos y los de una versión de formato que no soporte; para cambiar de transferencia el usuario DEBE cancelar e iniciar de nuevo la recepción. La activación está sujeta a la confirmación de FR-023. |
| FR-009 | Procesamiento de datos | Esencial | Aprobado | El receptor DEBE aceptar los fragmentos en cualquier orden y reordenarlos según su posición. |
| FR-010 | Procesamiento de datos | Esencial | Aprobado | El receptor DEBE ignorar los fragmentos que ya recibió, sin alterar el resultado. |
| FR-011 | Salidas del sistema | Alta | Aprobado | Durante la recepción, el sistema DEBE mostrar el nombre y tamaño total del archivo, el tiempo estimado restante, los fragmentos recibidos del total y una barra de progreso con el porcentaje recibido. |
| FR-012 | Procesamiento de datos | Esencial | Aprobado | Al tener todos los fragmentos, el receptor DEBE reconstruir el archivo y verificar su integridad automáticamente, sin acción del usuario, y liberar la cámara; solo entonces DEBE considerar la transferencia completada. |
| FR-013 | Salidas del sistema | Esencial | Aprobado | El receptor DEBE informar el resultado de la transferencia: **completada** (todos los fragmentos recibidos y verificación de integridad satisfactoria); **incompleta** (el usuario termina la lectura con el botón «Terminar lectura» y faltan fragmentos); **datos inválidos** (todos los fragmentos recibidos pero la verificación de integridad falla); **no reconstruible** (no se puede ensamblar el archivo, por ejemplo por metadatos inconsistentes); **almacenamiento lleno** (la recepción está completa y verificada, pero la cuota se agota al guardar: el sistema NO DEBE guardar ni registrar el archivo y DEBE ofrecer descargarlo en ese momento). |
| FR-014 | Casos de uso | Esencial | Aprobado | El usuario DEBE poder cancelar en cualquier momento, tanto en el emisor como en el receptor; la cancelación DEBE detener el proceso local, descartar los datos parciales y liberar sus recursos, incluida la cámara, sin pedir confirmación. La copia del archivo ya guardada por el emisor (FR-018) se conserva. |
| FR-015 | Procesamiento de datos | Esencial | Aprobado | Al completarse una recepción, el sistema DEBE guardar el archivo con su nombre y tipo originales en el almacenamiento privado de la aplicación, sin solicitar permisos de carpeta; un archivo con el mismo nombre que otro existente NO DEBE sobrescribirlo. |
| FR-016 | Salidas del sistema | Esencial | Aprobado | El sistema DEBE mostrar un historial de transferencias (enviadas y recibidas) con su contenido, ordenado del más reciente al más antiguo, con filtro Todos / Recibidos / Enviados, y permitir exportar cada archivo con su nombre original (descarga o compartir con otras aplicaciones del dispositivo). |
| FR-017 | Casos de uso | Esencial | Aprobado | El sistema DEBE permitir transferir archivos de tamaño superior al que cabe en un único QR, usando múltiples QR. |
| FR-018 | Procesamiento de datos | Alta | Aprobado | Al iniciar el envío de un archivo, el sistema DEBE guardar una copia en el almacenamiento privado de la aplicación para que figure en el historial como «enviado» con la fecha de inicio del envío (el emisor no sabe si el receptor lo recibió); enviar de nuevo el mismo archivo crea una entrada nueva. |
| FR-019 | Casos de uso | Alta | Aprobado | El usuario DEBE poder eliminar archivos del historial, previa confirmación, para liberar el espacio que ocupan. |
| FR-020 | Interacción de usuario | Alta | Aprobado | Al completarse una recepción, el sistema DEBE mostrar una previsualización del archivo (la imagen si lo es; en otro caso, un icono de archivo con su nombre) y abrir el archivo al hacer clic en ella (mostrándolo si el tipo se puede visualizar y, en otro caso, descargándolo), con el historial directamente debajo. |
| FR-021 | Flujos de proceso | Alta | Aprobado | Tras un resultado «incompleta», el receptor DEBE permitir seguir escaneando (reactivando la cámara) conservando los fragmentos válidos ya recibidos; tras «datos inválidos», «no reconstruible» o «almacenamiento lleno» DEBE permitir reintentar desde cero. Los fragmentos parciales solo permanecen en memoria mientras el usuario esté en el flujo de recepción (incluida la pantalla de resultado) y NO DEBEN persistirse: salir del flujo o recargar los descarta. |
| FR-022 | Salidas del sistema | Alta | Aprobado | El sistema DEBE informar con un aviso en la pantalla donde ocurra, sin iniciar la transferencia, cuando: no haya cámara, el usuario deniegue el permiso de cámara, el archivo esté vacío o no quepa en el almacenamiento disponible, falle la copia local del envío por cuota agotada (FR-018, el envío NO DEBE iniciarse), la cuota de almacenamiento se agote al guardar una recepción (resultado «almacenamiento lleno» de FR-013), o el navegador no sea compatible. Las recepciones fallidas NO DEBEN registrarse en el historial. El texto exacto de los avisos se define en la implementación. |
| FR-023 | Interacción de usuario | Esencial | Aprobado | Tras leer los metadatos de una transferencia, el receptor DEBE mostrar su nombre y tamaño y pedir confirmación antes de darla por activa; hasta confirmar, NO DEBE completar ni guardar ningún archivo, DEBE seguir mostrando los fragmentos ya leídos y el aviso de confirmación DEBE permanecer visible; al descartarla, DEBE ignorar sus fragmentos durante el resto de esa recepción, sin volver a avisar; cancelar e iniciar una recepción nueva la reactiva. Si se leen todos los fragmentos antes de confirmar, el archivo solo se reconstruye y guarda tras confirmar. Tras descartar, el receptor DEBE seguir leyendo y tomar como candidata la siguiente transferencia distinta que lea. |
| FR-024 | Salidas del sistema | Alta | Aprobado | El sistema DEBE informar con un mensaje claro, sin iniciar la transferencia, cuando el archivo requiera más fragmentos de los que admite el protocolo. |
| FR-025 | Procesamiento de datos | Media | Aprobado | Al guardar un archivo recibido, el sistema DEBERÍA solicitar almacenamiento persistente para reducir el riesgo de que el navegador lo borre. |

## 6. Requisitos no funcionales

| ID | Categoría | Prioridad | Estado | Enunciado |
| -- | --------- | --------- | ------ | --------- |
| NFR-001 | Seguridad | Esencial | Aprobado | Durante el envío o la recepción de un archivo, el sistema NO DEBE enviar el contenido ni los metadatos del archivo fuera de los dos dispositivos, ni realizar peticiones de red de ningún tipo (incluida telemetría). |
| NFR-002 | Fiabilidad | Esencial | Aprobado | Tras la primera carga con red, el sistema DEBE funcionar completamente sin conexión a Internet. |
| NFR-003 | Fiabilidad | Esencial | Aprobado | El archivo recibido DEBE ser idéntico byte a byte al original, comprobado con una verificación de integridad. |
| NFR-004 | Seguridad | Alta | Aprobado | El sistema DEBE persistir datos solo en el almacenamiento privado de la aplicación y NO DEBE leer ni escribir en el resto del sistema de archivos por iniciativa propia; la exportación, iniciada por el usuario, es la única salida de archivos. |
| NFR-005 | Mantenibilidad | Alta | Aprobado | El protocolo de transferencia DEBE estar separado de la interfaz de usuario y del mecanismo concreto de mostrar o capturar QR, y el formato DEBE incluir un número de versión para permitir su evolución. |
| NFR-006 | Usabilidad | Alta | Aprobado | Todas las pantallas (incluidos sus estados de error) DEBEN ser operables, sin desplazamiento horizontal, desde 360 px de ancho (móvil en retrato) hasta 1280 px o más (escritorio). |
| NFR-007 | Seguridad | Alta | Aprobado | La previsualización y apertura de un archivo recibido NO DEBEN ejecutar contenido activo del archivo (por ejemplo, scripts incrustados en SVG o HTML). |
| NFR-008 | Compatibilidad | Alta | Aprobado | El sistema DEBE funcionar en Chrome para Android (probado en Chrome 154 sobre Android 10); en navegadores sin `BarcodeDetector` el receptor DEBE leer con un lector en JavaScript. El funcionamiento en otros navegadores (Safari/iOS, Firefox) no se garantiza en esta versión. |
| NFR-009 | Eficiencia de rendimiento | Alta | Aprobado | El receptor DEBE leer un QR de 400 B con corrección M a unos 30 cm en al menos 9 de 10 intentos secuenciales. |
| NFR-010 | Eficiencia de rendimiento | Media | Aprobado | El sistema DEBERÍA transferir un archivo de 1 MB en 15 minutos o menos; este objetivo no está validado con cámara real y se verifica con transferencias reales. |
| NFR-011 | Fiabilidad | Media | Aprobado | La aplicación instalada DEBERÍA actualizarse a la versión nueva sin quedarse indefinidamente en una versión antigua (hallazgo H-13 del spike). |

**Origen de NFR-008 a NFR-011:** propuestos por el spike WI-002 y decididos por el usuario (compatibilidad solo Chrome en Android; 1 MB en 15 min como objetivo). **Portabilidad** queda cubierta por NFR-006 (pantallas) y NFR-008 (navegadores).

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

- Funciones del navegador: acceso a la cámara, almacenamiento privado de la aplicación, selector de archivos, descarga y compartir, y service worker para el modo offline. Disponibilidad confirmada en Chrome 154 sobre Android 10 (cámara, service worker, compartir archivos, almacenamiento privado, `storage.persist` no activo por defecto); `BarcodeDetector` solo existe en Chromium (NFR-008).

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
| Enviar: QR e información | [WF-002](wireframes/WF-002-enviar-seleccion.md) | Aprobado | Enviar abre el selector; al elegir se muestra solo el QR y la información del archivo, sin progreso porque el emisor no sabe cuánto recibió el otro (FR-002, FR-006, FR-014). Reemplaza la pantalla de transmisión previa (el identificador WF-003 se retiró y no se reutiliza). |
| Recibir: escaneo e información | [WF-004](wireframes/WF-004-recibir-escaneo.md) | Aprobado | Aviso de confirmación de nombre y tamaño visible con los fragmentos leídos (FR-023). Cámara arriba; abajo tamaño total, tiempo estimado y barra de progreso con porcentaje (FR-011); botón «Terminar lectura» para declarar «incompleta» (FR-013). |
| Resultado y previsualización | [WF-005](wireframes/WF-005-resultado-recepcion.md) | Aprobado | Variante «almacenamiento lleno» con opción de descargar (FR-013, FR-022).  Al terminar: previsualización (imagen o icono con nombre; clic abre el archivo) y el historial debajo (FR-020); variantes de error incluidas (Seguir escaneando / Reintentar, FR-021). Los valores de los wireframes (412 QR, tiempos) son solo ejemplos. |

**Navegación y comportamientos por defecto**

| Desde | Acción | Destino / comportamiento |
| ----- | ------ | ------------------------ |
| WF-001 | Enviar → elegir archivo | WF-002 con el QR en bucle; cerrar el selector sin elegir deja en WF-001 |
| WF-001 | Recibir | WF-004 con la cámara activa |
| WF-002 / WF-004 | Cancelar | Vuelve a WF-001; descarta lo parcial (el emisor conserva la copia ya guardada) |
| WF-004 | Terminar lectura | Con la transferencia confirmada y fragmentos faltantes, WF-005 en «incompleta»; si aún no se leyó ningún fragmento o la transferencia no está confirmada (aviso pendiente), equivale a Cancelar |
| WF-004 | Metadatos leídos | Aviso para confirmar nombre y tamaño; sin confirmar no se completa nada (FR-023) |
| WF-004 | Recepción completa | WF-005 en «completada», sin acción del usuario |
| WF-005 | Seguir escaneando | WF-004 con la cámara activa y los fragmentos válidos conservados |
| WF-005 | Reintentar | WF-004 desde cero |
| WF-001 / WF-005 | Historial | Filtro «Todos» por defecto; eliminar pide confirmación (FR-019); los avisos de FR-022 se muestran en la pantalla donde ocurre el caso |

## 12. Verificación y trazabilidad

| ID | Origen | Depende de | Método de verificación | Criterio de verificación |
| -- | ------ | ----------- | -------------------------- | --------------------------- |
| FR-001 | [RF-01](references/raw-requirement.md); wireframes | Ninguna | Demostración | Al pulsar Enviar se abre el selector y solo permite elegir un archivo de cualquier tipo; cerrarlo sin elegir no inicia nada. |
| FR-002 | Revisión de wireframes | FR-001 | Inspección | Con el QR visibles nombre, tipo, tamaño, cantidad de QR y tiempo estimado por vuelta; sin barra de avance. |
| FR-003 | [RF-02](references/raw-requirement.md); spike WI-002 | Ninguna | Prueba | Cada fragmento decodificado contiene identificador de transferencia, posición, total, verificación propia y contenido; por defecto el fragmento es de 400 B con corrección M; un tamaño mayor solo se adopta con 9 o más aciertos en 10 lecturas secuenciales a unos 30 cm. |
| FR-004 | Respuestas del usuario (almacenamiento y recepción); [spike WI-002](../../../archived/work-items/WI-002-spike-medicion-qr-android/spike-report.md) | FR-003 | Prueba | El nombre, el tipo y el hash SHA-256 se recuperan idénticos en el receptor. |
| FR-005 | [RF-03](references/raw-requirement.md); respuesta del usuario (velocidad automática) | FR-003 | Prueba | La velocidad se fija sin intervención del usuario y una transferencia completa se logra en el entorno de referencia definido por el spike. |
| FR-006 | [RF-07](references/raw-requirement.md) (sustituido en parte por el bucle); respuesta del usuario | FR-005 | Prueba | Tras tres vueltas completas sin cancelar, el emisor sigue mostrando la secuencia; al cancelar se detiene. |
| FR-007 | [RF-04](references/raw-requirement.md); spike WI-002 (H-11) | Ninguna | Demostración | El receptor lee la secuencia sin que el usuario capture fotos y no lanza una lectura nueva mientras otra está en curso. |
| FR-008 | [RF-02](references/raw-requirement.md); restricciones del requerimiento | FR-003 | Prueba | Con fragmentos de otra transferencia, alterados o de versión desconocida mezclados, el archivo recibido no cambia y se rechazan; la transferencia activa es la del primer fragmento válido. |
| FR-009 | [RF-05](references/raw-requirement.md) | FR-003 | Prueba | Fragmentos entregados en orden aleatorio producen el mismo archivo. |
| FR-010 | [RF-06](references/raw-requirement.md) | FR-003 | Prueba | Fragmentos repetidos no cambian el resultado. |
| FR-011 | Revisión de wireframes | FR-007 | Inspección | Durante la recepción, en escritorio y móvil, se muestran nombre, tamaño total, tiempo estimado restante, fragmentos recibidos del total y barra con porcentaje. |
| FR-012 | [RF-08](references/raw-requirement.md) | FR-009 | Prueba | Con todos los fragmentos leídos, la verificación y el resultado aparecen sin acción del usuario y la cámara se libera; el hash del archivo recibido coincide con el del original en el 100 % de las pruebas completadas. |
| FR-013 | [RF-09](references/raw-requirement.md); respuesta del usuario (terminar lectura) | FR-012 | Prueba | Se provocan los cinco resultados: completo → «completada»; «Terminar lectura» con faltantes → «incompleta»; alterar el contenido con todos los fragmentos → «datos inválidos»; metadatos inconsistentes → «no reconstruible»; cuota agotada al guardar → «almacenamiento lleno» con opción de descargar, sin entrada en el historial. Cada uno muestra su mensaje. |
| FR-014 | [RF-10](references/raw-requirement.md) | FR-018 | Prueba | Cancelar en emisor o receptor, sin confirmación, detiene el proceso, descarta datos parciales y libera la cámara; la copia ya guardada por el emisor permanece en el historial. |
| FR-015 | Respuestas del usuario (almacenamiento) | FR-012 | Prueba | El archivo recibido queda en el almacenamiento privado con su nombre y tipo originales sin que el navegador pida permiso de carpeta; dos recepciones con el mismo nombre quedan como dos entradas. |
| FR-016 | Respuestas del usuario (historial); revisión de wireframes | FR-015, FR-018 | Demostración | El historial lista recibidos y enviados del más reciente al más antiguo; cada filtro (Todos, Recibidos, Enviados) muestra solo lo que corresponde; cada archivo se exporta con su nombre original. |
| FR-017 | [RF-12](references/raw-requirement.md) | FR-003 | Prueba | Se transfiere con éxito un archivo mayor que la capacidad de un único QR (valor fijado por el spike). |
| FR-018 | Respuestas del usuario (historial de enviados con contenido) | FR-001 | Prueba | Al iniciar el envío, la copia del archivo figura en el historial. |
| FR-019 | Propuesta del agente confirmada por el usuario | FR-016 | Demostración | Al eliminar, tras confirmar, el archivo desaparece del historial y el espacio de almacenamiento usado disminuye en su tamaño. |
| FR-020 | Revisión de wireframes | FR-015 | Demostración | Una imagen se previsualiza; otro tipo muestra icono y nombre; el clic abre el archivo (lo muestra si se puede visualizar, lo descarga si no); el historial queda debajo. |
| FR-021 | Wireframe WF-005 y respuesta del usuario (terminar lectura) | FR-013 | Prueba | Tras «incompleta», seguir escaneando conserva los fragmentos ya válidos; tras los otros errores, reintentar empieza de cero; al recargar o salir del flujo no queda ningún fragmento almacenado. |
| FR-022 | Validación externa de Ola 3 | FR-001, FR-007, FR-015 | Prueba | Sin cámara o permiso, archivo vacío o que no cabe, cuota agotada o navegador incompatible: se muestra el mensaje y no se inicia; una recepción fallida no aparece en el historial. |
| FR-023 | Spike WI-002 (H-01, H-09); US-002 | FR-008 | Prueba | Con una secuencia ajena delante, el receptor muestra nombre y tamaño, no completa ni guarda nada hasta confirmar (0 de 10 transferencias ajenas completadas sin verlas), muestra los fragmentos leídos y mantiene visible el aviso; al descartar, ignora esa transferencia. |
| FR-024 | Spike WI-002 (H-03); US-001 | FR-003 | Prueba | Un archivo que exige más fragmentos de los admitidos muestra el mensaje y no inicia la transferencia. |
| FR-025 | Spike WI-002 (H-12); US-002 | FR-015 | Inspección | Al guardar una recepción se solicita almacenamiento persistente; su resultado es observable en el navegador. |
| NFR-001 | [RF-11](references/raw-requirement.md); restricciones | Ninguna | Prueba | Con el tráfico de red capturado, no hay ninguna petición durante el envío ni la recepción. |
| NFR-002 | Restricciones del requerimiento; respuesta del usuario (PWA) | Ninguna | Prueba | Tras la primera carga, la aplicación abre y transfiere sin red. |
| NFR-003 | [RF-08](references/raw-requirement.md) | FR-012 | Prueba | Comparación byte a byte del archivo recibido con el original, sin diferencias. |
| NFR-004 | Respuesta del usuario (almacenamiento) | FR-015 | Inspección | Revisión del código y de los permisos: solo hay lecturas y escrituras en el almacenamiento privado; la única salida de archivos es la exportación iniciada por el usuario. |
| NFR-005 | Consideraciones para el diseño del requerimiento | Ninguna | Inspección | El protocolo se ejecuta sin depender de UI ni de cámara, y el formato lleva número de versión. |
| NFR-006 | Respuesta del usuario (responsiva) | Ninguna | Demostración | Las cuatro pantallas y sus estados de error funcionan desde 360 px hasta 1280 px o más de ancho, sin desplazamiento horizontal. |
| NFR-007 | Propuesta del agente confirmada por el usuario | FR-020 | Prueba | Un SVG o HTML con script no ejecuta código al previsualizarse o abrirse. |
| NFR-008 | Spike WI-002; decisión del usuario | Ninguna | Prueba | Una transferencia completa se logra en Chrome para Android; sin `BarcodeDetector` el receptor lee con el lector en JavaScript. |
| NFR-009 | Spike WI-002 (medido 10 de 10) | FR-007 | Prueba | Serie de 10 lecturas secuenciales de un QR de 400 B con corrección M a unos 30 cm, con al menos 9 aciertos. |
| NFR-010 | Spike WI-002 (H-14); decisión del usuario | FR-005, FR-017 | Prueba | Transferencias reales de 1 MB con hash idéntico; se registra el tiempo y se compara con 15 minutos (objetivo, no bloqueante). |
| NFR-011 | Spike WI-002 (H-13) | NFR-002 | Demostración | Tras desplegar una versión nueva, la aplicación instalada pasa a ella tras recargar, sin quedarse en la antigua. |
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
| R-08 | Una secuencia ajena delante puede dejar al receptor con el archivo equivocado (H-01 del spike) | Media | Alto | Confirmación de nombre y tamaño antes de activar la transferencia (FR-023); prueba con cámara | FR-008, FR-023 |
| R-09 | Fuera de Chrome en Android el funcionamiento no está probado (Safari/iOS, Firefox) | Alta | Medio | Alcance limitado por NFR-008; lector de reserva en JavaScript; ampliar compatibilidad en una versión futura | NFR-008 |

## 14. Enlaces y archivos de apoyo

- **Requerimiento original:** [`references/raw-requirement.md`](references/raw-requirement.md)
- **Investigación de stack:** No aplica (stack decidido por el usuario).
- **Hallazgos de los spikes y decisiones:** [`references/raw-requirement-02-hallazgos-spike-wi-002.md`](references/raw-requirement-02-hallazgos-spike-wi-002.md)
- **Spikes:** [WI-002](../../../archived/work-items/WI-002-spike-medicion-qr-android/spike-report.md) y [WI-001](../../../archived/work-items/WI-001-spike-protocolo-transferencia-qr/spike-report.md)
- **Wireframes:** [`wireframes/`](wireframes/) — detalle por pantalla en la sección 11.

## 15. Historias de usuario derivadas

| US-XXX | Título | FR-XXX cubiertos |
| ------ | ------ | ----------------- |
| [US-001](../../user-stories/US-001-enviar-archivo-qr/README.md) | Enviar un archivo como secuencia de QR | FR-001 a FR-006, FR-014, FR-017, FR-018, FR-022, FR-024 |
| [US-002](../../user-stories/US-002-recibir-archivo-qr/README.md) | Recibir un archivo escaneando una secuencia de QR | FR-007 a FR-015, FR-020, FR-021, FR-022, FR-023, FR-025 |
| [US-003](../../user-stories/US-003-historial-transferencias/README.md) | Consultar y gestionar el historial de transferencias | FR-016, FR-019 |

## Observaciones

- **Spikes incorporados (2026-10-08):** se añadieron FR-023 a FR-025 y NFR-008 a NFR-011, y se actualizaron FR-003, FR-004, FR-007, FR-008, el repositorio (laboratorio-1, existente) y los riesgos. Los nuevos requisitos se aprobaron con las prioridades propuestas y WF-004 se actualizó con el aviso de confirmación (FR-023). Quedan por validar con cámara real, en las historias: transferencia completa de 1 MB, modo sin red y elección entre transferencias.
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
| Requisitos funcionales completos y priorizados | Cumple | FR-001 a FR-025 aprobados |
| Requisitos no funcionales revisados y priorizados | Cumple | NFR-001 a NFR-011 aprobados |
| Interfaces externas revisadas | Cumple | Usuario, hardware, software; comunicaciones no aplica |
| Requisitos de datos formalizados | Cumple | |
| Cumplimiento normativo trazado | Cumple | No aplica |
| Diseño de interfaz revisado | Cumple | 4 wireframes aprobados |
| Verificación y trazabilidad completas | Cumple | Incluye FR-023 a FR-025 y NFR-008 a NFR-011 |
| Riesgos identificados | Cumple | R-01 a R-09 |
| Alcance y fuera de alcance claros | Cumple | |
| Sin aclaraciones pendientes | Cumple | Las lagunas de detalle están delegadas a las tareas, registradas en Observaciones por decisión del usuario |
| Validación final (Ola 3) superada | Cumple | Quinta validación externa: «suficiente con reservas»; reservas delegadas |
