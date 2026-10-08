# US-001: Enviar un archivo como secuencia de QR

<!-- us:status=Draft -->
**Estado:** Draft
**Fecha de creación:** 2026-10-08
**Última actualización:** 2026-10-08
**Repositorios:** transferencia-qr-web
**INVEST:** 🟢 3 · 🟡 3 / 6
**DoR:** 🟢 3 · 🟡 2 · 🔴 1 / 6
**Requerimiento:** [SRS-001: Transferencia de archivos mediante secuencia de QR](../../requirements/SRS-001-transferencia-qr/README.md)

## Descripción

**COMO** persona que quiere pasar un archivo a otro dispositivo sin red
**QUIERO** elegir un archivo y mostrarlo como una secuencia de códigos QR en bucle
**PARA** que otro dispositivo lo reciba leyendo mi pantalla con su cámara

## Contexto

El emisor y el receptor son modos de una misma aplicación web instalable (PWA). El único canal es óptico (pantalla → cámara): el emisor no recibe información del receptor, por lo que no muestra progreso de transmisión. Esta historia incluye el protocolo de fragmentación (separado de la UI, con versión de formato) que la [US-002](../US-002-recibir-archivo-qr/README.md) consume. Los parámetros del protocolo (capacidad por QR, velocidad, fórmula del tiempo estimado) los fija un spike técnico previo (SRS-001, sección 2.5).

## Fuera de alcance

- Transferir varios archivos en una misma transferencia.
- Cifrado, compresión, corrección de errores, tamaño de fragmento y velocidad configurables (diferidos, SRS-001 sección 2.6).
- Confirmaciones del receptor y reintentos selectivos.

## Reglas de negocio

- **BR-01:** Una transferencia DEBE incluir exactamente un archivo. → verificado por AC-002

## Criterios de aceptación

- **AC-001 (Interacción de usuario):** Al pulsar «Enviar», el sistema DEBE abrir el selector de archivos del dispositivo y permitir elegir un archivo de cualquier tipo; si el usuario cierra el selector sin elegir, el sistema NO DEBE iniciar ninguna transferencia.
- **AC-002 (Reglas de negocio):** El sistema NO DEBE permitir elegir más de un archivo por transferencia.
- **AC-003 (Salidas del sistema):** Al elegir el archivo, el sistema DEBE mostrar la secuencia de QR y, debajo, el nombre, tipo y tamaño del archivo, la cantidad total de QR y el tiempo estimado por vuelta, sin mostrar progreso de transmisión; el tiempo estimado DEBE mostrarse como «calculando…» mientras no haya datos suficientes.
- **AC-004 (Procesamiento de datos):** El sistema DEBE dividir el archivo en fragmentos aptos para un QR, cada uno con identificador de transferencia, posición, número total de fragmentos, verificación de integridad propia y su contenido.
- **AC-005 (Procesamiento de datos):** El sistema DEBE transmitir el nombre y el tipo del archivo junto con su contenido para que el receptor los recupere.
- **AC-006 (Casos de uso):** El sistema DEBE permitir transferir archivos de tamaño superior al que cabe en un único QR, usando múltiples QR.
- **AC-007 (Salidas del sistema):** El emisor DEBE mostrar los QR de forma secuencial con una velocidad de cambio determinada automáticamente, sin intervención del usuario.
- **AC-008 (Flujos de proceso):** El emisor DEBE repetir la secuencia de QR en bucle hasta que su usuario cancele.
- **AC-009 (Casos de uso):** El usuario DEBE poder cancelar el envío en cualquier momento, sin confirmación; la cancelación DEBE detener la secuencia y liberar sus recursos, y la copia ya guardada del archivo (AC-010) DEBE conservarse.
- **AC-010 (Procesamiento de datos):** Al iniciar el envío, el sistema DEBERÍA guardar una copia del archivo en el almacenamiento privado de la aplicación para que figure en el historial.
- **AC-011 (Salidas del sistema):** El sistema DEBE mostrar un mensaje claro y NO DEBE iniciar la transferencia cuando el archivo esté vacío, no quepa en el almacenamiento disponible, la cuota se agote al guardar la copia o el navegador no sea compatible.
- **AC-012 (Seguridad):** Durante el envío, el sistema NO DEBE enviar el contenido ni los metadatos del archivo fuera del dispositivo ni realizar peticiones de red de ningún tipo, incluida telemetría.
- **AC-013 (Fiabilidad):** Tras la primera carga con red, el envío DEBE funcionar completamente sin conexión a Internet.
- **AC-014 (Mantenibilidad):** El protocolo de fragmentación DEBE estar separado de la interfaz de usuario y del mecanismo de mostrar QR, y el formato DEBE incluir un número de versión.
- **AC-015 (Usabilidad):** La pantalla de envío y sus estados de error DEBEN ser operables, sin desplazamiento horizontal, desde 360 px hasta 1280 px o más de ancho.

## Referencias

- **Wireframe:** [WF-002: Enviar: QR e información del archivo](../../requirements/SRS-001-transferencia-qr/wireframes/WF-002-enviar-seleccion.md) — Aprobado ([SVG](../../requirements/SRS-001-transferencia-qr/wireframes/WF-002-enviar-seleccion.svg)); entrada «Enviar» en [WF-001](../../requirements/SRS-001-transferencia-qr/wireframes/WF-001-inicio-historial.md).
- **Requerimiento original:** [raw-requirement.md](../../requirements/SRS-001-transferencia-qr/references/raw-requirement.md)

## Observaciones

- Dependencias no listas: el spike técnico del SRS-001 debe fijar capacidad por QR, velocidad automática, fórmula y precisión del tiempo estimado, y entregar los NFR de rendimiento y compatibilidad; hasta entonces AC-003, AC-006 y AC-007 no tienen umbrales medibles.
- Decisiones pendientes: algoritmo de fragmentación, formato del payload, librería de generación de QR y navegadores soportados (spike).
- Sin documentación técnica en `docs/architecture/` todavía: el protocolo se especificará con `/design-define` cuando el spike lo resuelva.
- Cobertura del SRS: FR-001 a FR-006, FR-014 (emisor), FR-017, FR-018, FR-022 (emisor), NFR-001, NFR-002, NFR-005, NFR-006 y BR-01.

---

## Validación

### Complejidad sugerida

- **Story points:** 8
- **Justificación:** Incluye el protocolo de fragmentación y la visualización en bucle con incertidumbre técnica alta (capacidad y velocidad de QR) pendiente del spike.

### INVEST

| Letra | Criterio      | Resultado | Notas |
| ----- | ------------- | --------- | ----- |
| **I** | Independiente | Parcial   | Depende del spike técnico; es prerrequisito de la US-002. |
| **N** | Negociable    | Cumple    | El detalle de protocolo y librerías queda abierto. |
| **V** | Valiosa       | Cumple    | Permite iniciar una transferencia sin red. |
| **E** | Estimable     | Parcial   | Estimación sujeta al resultado del spike. |
| **S** | Pequeña       | Parcial   | 15 criterios; revisar si el protocolo se separa en otra historia tras el spike. |
| **T** | Testeable     | Cumple    | Cada criterio tiene verificación observable; los umbrales de rendimiento llegarán con el spike. |

### Definition of Ready (DoR)

| Criterio DoR                       | Estado    | Notas |
| ---------------------------------- | --------- | ----- |
| Dependencias listas                | Parcial   | Spike técnico pendiente. |
| Inputs/outputs claros              | Cumple    | Archivo de entrada; secuencia de QR e información de salida. |
| Repositorios definidos             | Cumple    | transferencia-qr-web (nuevo, base angular-base). |
| Sin decisiones técnicas pendientes | No cumple | Protocolo, payload y librerías pendientes del spike. |
| Referencias de UI                  | Cumple    | WF-002 aprobado. |
| Sin aclaraciones pendientes        | Parcial   | Ver Observaciones. |
