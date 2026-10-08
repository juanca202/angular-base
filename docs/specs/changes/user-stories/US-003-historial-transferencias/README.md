# US-003: Consultar y gestionar el historial de transferencias

<!-- us:status=Ready -->
**Estado:** Ready
**Fecha de creación:** 2026-10-08
**Última actualización:** 2026-10-08
**Repositorios:** laboratorio-1
**INVEST:** 🟢 6 / 6
**DoR:** 🟢 6 / 6
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
  Casos de prueba: [TC-001](./test-cases/TC-001-historial-recientes-primero-happy.md) · [TC-002](./test-cases/TC-002-orden-no-depende-de-insercion-limite.md)
- **AC-002 (Interacción de usuario):** El sistema DEBE permitir filtrar el historial por Todos, Recibidos o Enviados.
  Casos de prueba: [TC-003](./test-cases/TC-003-filtro-recibidos-happy.md) · [TC-004](./test-cases/TC-004-filtro-enviados-happy.md) · [TC-005](./test-cases/TC-005-filtro-todos-por-defecto-y-al-volver-limite.md)
- **AC-003 (Salidas del sistema):** El sistema DEBE permitir exportar cada archivo con su nombre original, mediante descarga o compartiendo con otras aplicaciones del dispositivo.
  Casos de prueba: [TC-006](./test-cases/TC-006-exportar-por-descarga-nombre-original-happy.md) · [TC-007](./test-cases/TC-007-exportar-compartiendo-con-otras-apps-happy.md) · [TC-008](./test-cases/TC-008-compartir-cancelado-conserva-historial-error.md) · [TC-009](./test-cases/TC-009-exportar-nombre-con-espacios-y-acentos-limite.md)
- **AC-004 (Casos de uso):** El usuario DEBE poder eliminar archivos del historial, previa confirmación, y el sistema DEBE liberar el espacio que ocupan.
  Casos de prueba: [TC-010](./test-cases/TC-010-eliminar-tras-confirmar-libera-espacio-happy.md) · [TC-011](./test-cases/TC-011-eliminar-cancelado-no-borra-error.md) · [TC-012](./test-cases/TC-012-eliminar-ultimo-archivo-muestra-vacio-limite.md)
- **AC-005 (Seguridad):** El sistema DEBE persistir datos solo en el almacenamiento privado de la aplicación y NO DEBE leer ni escribir en el resto del sistema de archivos por iniciativa propia; la exportación, iniciada por el usuario, DEBE ser la única salida de archivos.
  Casos de prueba: [TC-013](./test-cases/TC-013-solo-almacenamiento-privado-happy.md) · [TC-014](./test-cases/TC-014-exportar-unica-salida-iniciada-por-usuario-error.md)
- **AC-006 (Usabilidad):** La pantalla de inicio e historial DEBE ser operable sin desplazamiento horizontal desde 360 px hasta 1280 px o más de ancho.
  Casos de prueba: [TC-015](./test-cases/TC-015-historial-sin-scroll-horizontal-360px-limite.md) · [TC-016](./test-cases/TC-016-historial-sin-scroll-horizontal-1280px-limite.md)
- **AC-007 (Salidas del sistema):** Mientras el historial no tenga transferencias, el sistema DEBE mostrar el mensaje «Aún no hay transferencias» en lugar de la lista.
  Casos de prueba: [TC-017](./test-cases/TC-017-historial-vacio-mensaje-happy.md)

## Referencias

- **Wireframe:** [WF-001: Inicio e historial](../../requirements/SRS-001-transferencia-qr/wireframes/WF-001-inicio-historial.md) — Aprobado ([SVG](../../requirements/SRS-001-transferencia-qr/wireframes/WF-001-inicio-historial.svg), [móvil](../../requirements/SRS-001-transferencia-qr/wireframes/WF-001-inicio-historial-movil.svg))
- **Requerimiento original:** [raw-requirement.md](../../requirements/SRS-001-transferencia-qr/references/raw-requirement.md)

## Observaciones

- Dependencias: [US-001](../US-001-enviar-archivo-qr/README.md) y [US-002](../US-002-recibir-archivo-qr/README.md) (generan las entradas del historial) ya están en Ready.
- Compartir archivos está confirmado en Chrome 154 sobre Android 10 (spike WI-002, SRS-001 sección 8); otros navegadores quedan sin garantía (NFR-008).
- Campos del historial, saneamiento de nombres y tratamiento de nombres duplicados al exportar: se resuelven en las tareas (SRS-001, sección 15).
- Cobertura del SRS: FR-016, FR-019, NFR-004, NFR-006.

---

## Validación

### Complejidad sugerida

- **Story points:** 5
- **Justificación:** Lista, filtro, exportación y borrado sobre almacenamiento local; riesgo moderado por cuota y compatibilidad de compartir.

### INVEST

| Letra | Criterio      | Resultado | Notas |
| ----- | ------------- | --------- | ----- |
| **I** | Independiente | Cumple    | US-001 y US-002 ya están en Ready; además puede probarse con datos sembrados. |
| **N** | Negociable    | Cumple    | Formato de lista y de confirmación abiertos. |
| **V** | Valiosa       | Cumple    | Permite recuperar y gestionar lo transferido. |
| **E** | Estimable     | Cumple    | Alcance acotado y conocido. |
| **S** | Pequeña       | Cumple    | Siete criterios. |
| **T** | Testeable     | Cumple    | Verificable por demostración. |

### Definition of Ready (DoR)

| Criterio DoR                       | Estado  | Notas |
| ---------------------------------- | ------- | ----- |
| Dependencias listas                | Cumple  | US-001 y US-002 en Ready. |
| Inputs/outputs claros              | Cumple  | Entradas del historial de entrada; lista, archivo exportado o eliminación de salida. |
| Repositorios definidos             | Cumple  | laboratorio-1. |
| Sin decisiones técnicas pendientes | Cumple  | Almacenamiento privado del navegador ya decidido. |
| Referencias de UI                  | Cumple  | WF-001 aprobado. |
| Sin aclaraciones pendientes        | Cumple  | Ninguna. |
