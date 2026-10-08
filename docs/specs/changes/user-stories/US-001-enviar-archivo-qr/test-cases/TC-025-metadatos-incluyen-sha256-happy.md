# TC-025 — Dado un archivo conocido, Cuando se genera el fragmento de metadatos, Entonces incluye el hash SHA-256 del archivo completo

<!-- tc:status=Ready · testType=Unit · criterion=AC-019 · parent=US-001 -->
**Perspectiva:** Happy Path
**Tipo de prueba:** Unit
**Prioridad:** Alta
**Criterio de aceptación:** AC-019 (Fiabilidad)
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
| 1 | Sistema | Fragmentar prueba-100KB.bin | Se genera el fragmento de metadatos |
| 2 | Sistema | Leer el hash de los metadatos y calcular el SHA-256 del archivo | Ambos valores coinciden |

## Resultado esperado final

Los metadatos contienen el SHA-256 correcto del archivo.

## Observaciones

Entorno de referencia: desarrollo local (supuesto confirmado por el usuario).
