# TC-013 — Dado el uso normal del historial, Cuando se listan, filtran, envían o eliminan archivos, Entonces solo se accede al almacenamiento privado de la aplicación

<!-- tc:status=Ready · testType=Integration · criterion=AC-005 · parent=US-003 -->
**Perspectiva:** Happy Path
**Tipo de prueba:** Integration
**Prioridad:** Alta
**Criterio de aceptación:** AC-005 (Seguridad)
**Artefacto padre:** US-003
**Estado:** Ready
**Creado por:** juanca202
**Fecha:** 2026-10-08

## Precondiciones

- App servida en desarrollo local (`ng serve` o build local) y abierta en Chrome; sin cuentas ni servidor (entorno de referencia: desarrollo).
- Herramientas de desarrollo abiertas (pestañas Application y Network) o espías sobre las APIs de almacenamiento.

## Datos de prueba

| Campo | Valor | Notas |
|-------|-------|-------|
| Historial | Historial sembrado [propuesto]: recibido «foto.png» (20 KB, hace 3 días), enviado «informe.pdf» (150 KB, hace 2 días), recibido «notas.txt» (2 KB, hace 1 día), enviado «datos.bin» (100 KB, hace 1 hora) | — |

## Pasos de ejecución

| # | Actor | Acción | Resultado esperado del paso |
|---|-------|--------|-----------------------------|
| 1 | Usuario | Listar, filtrar y eliminar una entrada | Las lecturas/escrituras se observan solo en el almacenamiento privado (Cache/IndexedDB/OPFS) |
| 2 | Usuario | Revisar el código y los permisos del manifiesto | No hay selectores de carpeta ni acceso al sistema de archivos fuera del privado salvo el flujo de exportación |

## Resultado esperado final

Sin accesos al resto del sistema de archivos por iniciativa propia.

## Observaciones

Entorno de referencia: desarrollo local, Chrome (confirmado por el usuario). Verificación por inspección (SRS NFR-004).
