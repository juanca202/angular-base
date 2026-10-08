# TC-024 — Dado un archivo SVG con un script incrustado recibido, Cuando se previsualiza y se abre, Entonces no se ejecuta ningún contenido activo

<!-- tc:status=Ready · testType=E2E · criterion=AC-014 · parent=US-002 -->
**Perspectiva:** Error
**Tipo de prueba:** E2E
**Prioridad:** Alta
**Criterio de aceptación:** AC-014 (Seguridad)
**Artefacto padre:** US-002
**Estado:** Ready
**Creado por:** juanca202
**Fecha:** 2026-10-08

## Precondiciones

- App servida en desarrollo local (`ng serve` o build local) y abierta en Chrome; sin cuentas ni servidor (entorno de referencia: desarrollo).

## Datos de prueba

| Campo | Valor | Notas |
|-------|-------|-------|
| Archivo | malicioso.svg [propuesto] | SVG con <script> que escribe window.__pwned = true |

## Pasos de ejecución

| # | Actor | Acción | Resultado esperado del paso |
|---|-------|--------|-----------------------------|
| 1 | Sistema | Recibir malicioso.svg con un script que marca una bandera | Recepción completada |
| 2 | Usuario | Previsualizar y abrir el archivo | No se ejecuta el script; la bandera no cambia |

## Resultado esperado final

El contenido activo del archivo no se ejecuta.

## Observaciones

Entorno de referencia: desarrollo local (supuesto confirmado por el usuario).
