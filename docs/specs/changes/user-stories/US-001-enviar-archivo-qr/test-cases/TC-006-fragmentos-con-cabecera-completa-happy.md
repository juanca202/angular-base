# TC-006 — Dado un archivo de 100 KB, Cuando se fragmenta con el protocolo, Entonces cada fragmento lleva identificador de transferencia, posición, total, verificación propia y contenido

<!-- tc:status=Ready · testType=Unit · criterion=AC-004 · parent=US-001 -->
**Perspectiva:** Happy Path
**Tipo de prueba:** Unit
**Prioridad:** Alta
**Criterio de aceptación:** AC-004 (Procesamiento de datos)
**Artefacto padre:** US-001
**Estado:** Ready
**Creado por:** juanca202
**Fecha:** 2026-10-08

## Precondiciones

- Protocolo ejecutable sin interfaz ni cámara.

## Datos de prueba

| Campo | Valor | Notas |
|-------|-------|-------|
| Archivo | prueba-100KB.bin [propuesto] | Binario determinista de 100 KB (102 400 B) |

## Pasos de ejecución

| # | Actor | Acción | Resultado esperado del paso |
|---|-------|--------|-----------------------------|
| 1 | Sistema | Fragmentar prueba-100KB.bin | Se obtiene la lista de fragmentos |
| 2 | Sistema | Decodificar la cabecera de cada fragmento | Todos traen id, posición, total, CRC y carga útil coherentes |

## Resultado esperado final

Cada fragmento decodificado contiene todos los campos y su verificación propia es válida.

## Observaciones

Entorno de referencia: desarrollo local (supuesto confirmado por el usuario).
