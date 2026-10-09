# TC-040 — Dado un QR que se pierde en un cuadro, Cuando pasan menos de unos 0,4 s sin detectarlo, Entonces el recuadro se mantiene, y desaparece después o al detener la lectura

<!-- tc:status=Ready · testType=Unit · criterion=AC-026 · parent=US-002 -->
**Perspectiva:** Límite
**Tipo de prueba:** Unit
**Prioridad:** Baja
**Criterio de aceptación:** AC-026 (Salidas del sistema)
**Artefacto padre:** US-002
**Estado:** Ready
**Creado por:** juanca202
**Fecha:** 2026-10-09

## Precondiciones

- Decodificador de QR con el lector simulado y un reloj controlado.

## Datos de prueba

| Campo | Valor | Notas |
|-------|-------|-------|
| Pérdida del QR | 200 ms y 600 ms sin detección [propuesto] | Por debajo y por encima de los 0,4 s |

## Pasos de ejecución

| # | Actor | Acción | Resultado esperado del paso |
|---|-------|--------|-----------------------------|
| 1 | Sistema | Detectar un QR y después un cuadro sin QR a los 200 ms | El recuadro se mantiene en su última posición |
| 2 | Sistema | Repetir con un cuadro sin QR a los 600 ms | El recuadro desaparece |
| 3 | Sistema | Detener la lectura | El recuadro se borra de inmediato |

## Resultado esperado final

Un fallo suelto no hace parpadear el recuadro; si el QR no vuelve, desaparece, y al detener la lectura se borra.

## Observaciones

Entorno de referencia: desarrollo local (supuesto confirmado por el usuario). El tiempo de retención (0,4 s) es el de SRS-001 FR-036.
