# US-002: Recibir un archivo escaneando una secuencia de QR

<!-- us:status=Draft -->
**Estado:** Draft
**Fecha de creación:** 2026-10-08
**Última actualización:** 2026-10-08
**Repositorios:** transferencia-qr-web
**INVEST:** 🟢 2 · 🟡 4 / 6
**DoR:** 🟢 3 · 🟡 2 · 🔴 1 / 6
**Requerimiento:** [SRS-001: Transferencia de archivos mediante secuencia de QR](../../requirements/SRS-001-transferencia-qr/README.md)

## Descripción

**COMO** persona que quiere recibir un archivo desde otro dispositivo sin red
**QUIERO** apuntar la cámara a la secuencia de QR del emisor y obtener el archivo reconstruido y verificado
**PARA** tener una copia idéntica del archivo guardada en mi dispositivo

## Contexto

Consume el protocolo definido en la [US-001](../US-001-enviar-archivo-qr/README.md). La lectura es continua (sin fotos manuales) y tolera duplicados, desorden y lecturas corruptas. Los fragmentos parciales viven solo en memoria mientras la pantalla de recepción está abierta. El texto exacto de los mensajes de error se define en la implementación.

## Fuera de alcance

- Reintentos selectivos o confirmaciones hacia el emisor (no hay canal de retorno).
- Persistir fragmentos parciales entre sesiones.
- Elegir carpetas del sistema para guardar (se usa el almacenamiento privado de la app).

## Reglas de negocio

- **BR-02:** Una transferencia DEBE considerarse completada solo si la verificación de integridad es satisfactoria. → verificado por AC-006, AC-007
- **BR-03:** Si la verificación falla o faltan fragmentos, el sistema NO DEBE guardar el archivo recibido ni registrarlo en el historial. → verificado por AC-018

## Criterios de aceptación

- **AC-001 (Interacción de usuario):** Al pulsar «Recibir», el sistema DEBE activar la cámara y leer automáticamente los QR sin que el usuario tome fotografías individuales.
- **AC-002 (Procesamiento de datos):** El receptor DEBE descartar los fragmentos que pertenezcan a otra transferencia o que estén corruptos o inválidos.
- **AC-003 (Procesamiento de datos):** El receptor DEBE aceptar los fragmentos en cualquier orden y reordenarlos según su posición.
- **AC-004 (Procesamiento de datos):** El receptor DEBE ignorar los fragmentos ya recibidos, sin alterar el resultado.
- **AC-005 (Salidas del sistema):** Durante la recepción, el sistema DEBE mostrar el nombre y tamaño total del archivo, el tiempo estimado restante, los fragmentos recibidos del total y una barra de progreso con el porcentaje recibido; en móvil DEBE mostrar al menos nombre, tamaño, tiempo y porcentaje.
- **AC-006 (Procesamiento de datos):** Al tener todos los fragmentos, el receptor DEBE reconstruir el archivo y verificar su integridad automáticamente, sin acción del usuario, y liberar la cámara; solo entonces DEBE considerar la transferencia completada.
- **AC-007 (Salidas del sistema):** El receptor DEBE informar el resultado: «completada» (todos los fragmentos y verificación satisfactoria); «incompleta» (el usuario pulsa «Terminar lectura» y faltan fragmentos); «datos inválidos» (todos los fragmentos pero falla la verificación); «no reconstruible» (no se puede ensamblar, p. ej. metadatos inconsistentes).
- **AC-008 (Casos de uso):** El usuario DEBE poder cancelar la recepción en cualquier momento, sin confirmación; la cancelación DEBE detener el proceso, descartar los datos parciales y liberar la cámara.
- **AC-009 (Procesamiento de datos):** Al completarse la recepción, el sistema DEBE guardar el archivo con su nombre y tipo originales en el almacenamiento privado de la aplicación, sin solicitar permisos de carpeta, y NO DEBE sobrescribir un archivo existente con el mismo nombre.
- **AC-010 (Interacción de usuario):** Al completarse la recepción, el sistema DEBE mostrar una previsualización (la imagen si lo es; en otro caso, un icono con el nombre) con el historial directamente debajo, y DEBE abrir el archivo al hacer clic en ella (mostrándolo si el tipo es visualizable y, si no, descargándolo).
- **AC-011 (Flujos de proceso):** Tras «incompleta», el receptor DEBE permitir seguir escaneando conservando los fragmentos válidos ya recibidos; tras «datos inválidos» o «no reconstruible» DEBE permitir reintentar desde cero. Los fragmentos parciales NO DEBEN persistirse.
- **AC-012 (Salidas del sistema):** El sistema DEBE mostrar un mensaje claro y NO DEBE iniciar la recepción cuando no haya cámara o permiso para usarla o el navegador no sea compatible, y DEBE avisar si la cuota de almacenamiento se agota al guardar.
- **AC-013 (Fiabilidad):** El archivo recibido DEBE ser idéntico byte a byte al original, comprobado con una verificación de integridad.
- **AC-014 (Seguridad):** La previsualización y apertura del archivo recibido NO DEBEN ejecutar contenido activo (p. ej. scripts incrustados en SVG o HTML).
- **AC-015 (Seguridad):** Durante la recepción, el sistema NO DEBE enviar contenido ni metadatos fuera del dispositivo ni realizar peticiones de red de ningún tipo, incluida telemetría.
- **AC-016 (Fiabilidad):** Tras la primera carga con red, la recepción DEBE funcionar completamente sin conexión a Internet.
- **AC-017 (Usabilidad):** Las pantallas de recepción y resultado, incluidos sus estados de error, DEBEN ser operables sin desplazamiento horizontal desde 360 px hasta 1280 px o más de ancho.
- **AC-018 (Reglas de negocio):** Tras un resultado «incompleta», «datos inválidos» o «no reconstruible», el sistema NO DEBE guardar el archivo ni registrarlo en el historial.

## Referencias

- **Wireframe:** [WF-004: Recibir: escaneo e información](../../requirements/SRS-001-transferencia-qr/wireframes/WF-004-recibir-escaneo.md) — Aprobado ([SVG](../../requirements/SRS-001-transferencia-qr/wireframes/WF-004-recibir-escaneo.svg))
- **Wireframe:** [WF-005: Resultado y previsualización](../../requirements/SRS-001-transferencia-qr/wireframes/WF-005-resultado-recepcion.md) — Aprobado ([SVG](../../requirements/SRS-001-transferencia-qr/wireframes/WF-005-resultado-recepcion.svg)); incluye variantes de error
- **Requerimiento original:** [raw-requirement.md](../../requirements/SRS-001-transferencia-qr/references/raw-requirement.md)

## Observaciones

- Dependencias no listas: [US-001](../US-001-enviar-archivo-qr/README.md) (protocolo) y el spike técnico del SRS-001 (NFR de rendimiento y compatibilidad, navegadores soportados).
- Decisiones pendientes: librería de lectura de QR y estrategia de sincronización (spike).
- Sin documentación técnica en `docs/architecture/` todavía; se especificará con `/design-define` tras el spike.
- Cobertura del SRS: FR-007 a FR-015, FR-020, FR-021, FR-022 (recepción), FR-014 (receptor), NFR-001 a NFR-003, NFR-006, NFR-007, BR-02, BR-03.

---

## Validación

### Complejidad sugerida

- **Story points:** 13
- **Justificación:** Lectura continua con cámara, reensamblado tolerante a fallos, verificación de integridad, cuatro resultados y previsualización segura; alta incertidumbre por compatibilidad de cámara. Valorar dividir tras el spike.

### INVEST

| Letra | Criterio      | Resultado | Notas |
| ----- | ------------- | --------- | ----- |
| **I** | Independiente | Parcial   | Depende de la US-001 y del spike. |
| **N** | Negociable    | Cumple    | Mensajes y presentación concretos quedan a la implementación. |
| **V** | Valiosa       | Cumple    | Cierra el ciclo de transferencia. |
| **E** | Estimable     | Parcial   | Sujeta al spike de cámara y navegadores. |
| **S** | Pequeña       | Parcial   | 18 criterios; candidata a dividirse (recepción / resultado y previsualización). |
| **T** | Testeable     | Cumple    | Los cuatro resultados son provocables y verificables. |

### Definition of Ready (DoR)

| Criterio DoR                       | Estado    | Notas |
| ---------------------------------- | --------- | ----- |
| Dependencias listas                | Parcial   | US-001 y spike pendientes. |
| Inputs/outputs claros              | Cumple    | Secuencia de QR de entrada; archivo guardado y resultado de salida. |
| Repositorios definidos             | Cumple    | transferencia-qr-web. |
| Sin decisiones técnicas pendientes | No cumple | Librería de lectura y sincronización pendientes del spike. |
| Referencias de UI                  | Cumple    | WF-004 y WF-005 aprobados. |
| Sin aclaraciones pendientes        | Parcial   | Ver Observaciones. |
