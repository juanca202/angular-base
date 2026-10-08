# US-003: Consultar y gestionar el historial de transferencias

<!-- us:status=Draft -->
**Estado:** Draft
**Fecha de creación:** 2026-10-08
**Última actualización:** 2026-10-08
**Repositorios:** transferencia-qr-web
**INVEST:** 🟢 5 · 🟡 1 / 6
**DoR:** 🟢 5 · 🟡 1 / 6
**Requerimiento:** [SRS-001: Transferencia de archivos mediante secuencia de QR](../../requirements/SRS-001-transferencia-qr/README.md)

## Descripción

**COMO** persona que ha enviado o recibido archivos
**QUIERO** ver, filtrar, exportar y eliminar los archivos de mi historial
**PARA** recuperar lo transferido y liberar el espacio que ocupa

## Contexto

El historial vive en la pantalla de inicio, bajo los botones Enviar y Recibir, y se alimenta de los envíos ([US-001](../US-001-enviar-archivo-qr/README.md)) y las recepciones exitosas ([US-002](../US-002-recibir-archivo-qr/README.md)). Los archivos se guardan sin cifrar en el almacenamiento privado de la aplicación (cifrado diferido, SRS-001 riesgo R-03).

## Fuera de alcance

- Cifrado de los archivos almacenados.
- Guardar en carpetas del sistema elegidas por el usuario.

## Criterios de aceptación

- **AC-001 (Salidas del sistema):** El sistema DEBE mostrar un historial de transferencias, enviadas y recibidas, con su contenido, ordenado del más reciente al más antiguo.
- **AC-002 (Interacción de usuario):** El sistema DEBE permitir filtrar el historial por Todos, Recibidos o Enviados.
- **AC-003 (Salidas del sistema):** El sistema DEBE permitir exportar cada archivo con su nombre original, mediante descarga o compartiendo con otras aplicaciones del dispositivo.
- **AC-004 (Casos de uso):** El usuario DEBE poder eliminar archivos del historial, previa confirmación, y el sistema DEBE liberar el espacio que ocupan.
- **AC-005 (Seguridad):** El sistema DEBE persistir datos solo en el almacenamiento privado de la aplicación y NO DEBE leer ni escribir en el resto del sistema de archivos por iniciativa propia; la exportación, iniciada por el usuario, DEBE ser la única salida de archivos.
- **AC-006 (Usabilidad):** La pantalla de inicio e historial DEBE ser operable sin desplazamiento horizontal desde 360 px hasta 1280 px o más de ancho.

## Referencias

- **Wireframe:** [WF-001: Inicio e historial](../../requirements/SRS-001-transferencia-qr/wireframes/WF-001-inicio-historial.md) — Aprobado ([SVG](../../requirements/SRS-001-transferencia-qr/wireframes/WF-001-inicio-historial.svg), [móvil](../../requirements/SRS-001-transferencia-qr/wireframes/WF-001-inicio-historial-movil.svg))
- **Requerimiento original:** [raw-requirement.md](../../requirements/SRS-001-transferencia-qr/references/raw-requirement.md)

## Observaciones

- Dependencias no listas: [US-001](../US-001-enviar-archivo-qr/README.md) y [US-002](../US-002-recibir-archivo-qr/README.md) (generan las entradas del historial); ambas siguen en Draft.
- Disponibilidad de compartir/exportar por navegador, a confirmar en el spike de navegadores soportados.
- Cobertura del SRS: FR-016, FR-019, NFR-004, NFR-006.

---

## Validación

### Complejidad sugerida

- **Story points:** 5
- **Justificación:** Lista, filtro, exportación y borrado sobre almacenamiento local; riesgo moderado por cuota y compatibilidad de compartir.

### INVEST

| Letra | Criterio      | Resultado | Notas |
| ----- | ------------- | --------- | ----- |
| **I** | Independiente | Parcial   | Necesita las entradas generadas por US-001/US-002 (puede probarse con datos sembrados). |
| **N** | Negociable    | Cumple    | Formato de lista y de confirmación abiertos. |
| **V** | Valiosa       | Cumple    | Permite recuperar y gestionar lo transferido. |
| **E** | Estimable     | Cumple    | Alcance acotado y conocido. |
| **S** | Pequeña       | Cumple    | Seis criterios. |
| **T** | Testeable     | Cumple    | Verificable por demostración. |

### Definition of Ready (DoR)

| Criterio DoR                       | Estado  | Notas |
| ---------------------------------- | ------- | ----- |
| Dependencias listas                | Parcial | US-001 y US-002 en Draft. |
| Inputs/outputs claros              | Cumple  | Entradas del historial de entrada; lista, archivo exportado o eliminación de salida. |
| Repositorios definidos             | Cumple  | transferencia-qr-web. |
| Sin decisiones técnicas pendientes | Cumple  | Almacenamiento privado del navegador ya decidido. |
| Referencias de UI                  | Cumple  | WF-001 aprobado. |
| Sin aclaraciones pendientes        | Cumple  | Ninguna. |
