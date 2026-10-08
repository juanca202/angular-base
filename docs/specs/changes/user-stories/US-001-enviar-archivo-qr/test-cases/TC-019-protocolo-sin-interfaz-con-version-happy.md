# TC-019 — Dado el módulo de protocolo aislado de la interfaz y de la cámara, Cuando se ejecuta la fragmentación en un entorno sin DOM, Entonces funciona sin dependencias de UI y el formato lleva número de versión

<!-- tc:status=Ready · testType=Unit · criterion=AC-014 · parent=US-001 -->
**Perspectiva:** Happy Path
**Tipo de prueba:** Unit
**Prioridad:** Alta
**Criterio de aceptación:** AC-014 (Mantenibilidad)
**Artefacto padre:** US-001
**Estado:** Ready
**Creado por:** juanca202
**Fecha:** 2026-10-08

## Precondiciones

- Pruebas de unidad en Vitest sin entorno de navegador.

## Datos de prueba

| Campo | Valor | Notas |
|-------|-------|-------|
| Archivo | prueba-1KB.bin [propuesto] | Binario determinista de 1 KB (1 024 B) |

## Pasos de ejecución

| # | Actor | Acción | Resultado esperado del paso |
|---|-------|--------|-----------------------------|
| 1 | Sistema | Ejecutar el protocolo en un entorno sin DOM ni cámara | Fragmenta y reensambla correctamente |
| 2 | Sistema | Leer el byte de versión de un fragmento | Contiene el número de versión del formato |

## Resultado esperado final

El protocolo es independiente de la UI y el formato lleva versión.

## Observaciones

Entorno de referencia: desarrollo local (supuesto confirmado por el usuario).
