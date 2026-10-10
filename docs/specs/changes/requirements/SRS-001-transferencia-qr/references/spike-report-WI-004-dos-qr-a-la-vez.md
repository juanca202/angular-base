# Informe del spike WI-004: Mostrar y leer dos QR a la vez para acelerar la transferencia

<!-- spike:verdict=NOT_VIABLE · timebox=none/none · branch=none · head=563e877 · generated=2026-10-09 -->
**Spike:** [WI-004: Mostrar y leer dos QR a la vez para acelerar la transferencia](../../../../archived/work-items/WI-004-spike-dos-qr-a-la-vez/README.md)
**Veredicto:** ❌ No viable
**Subtipo:** funcional
**Timebox:** Sin timebox formal · consumido: una ronda de pruebas (2026-10-09)
**Rama de referencia:** ninguna; implementado en `b8d3911` y retirado en `ddcaaab` y `563e877`
**Fecha:** 2026-10-09
**Autor:** juanca202 / Claude

## Resumen ejecutivo

Mostrar dos QR a la vez no funcionó en las pruebas con dispositivos. Con `jsQR`, ningún QR se lee si hay dos en la imagen aunque estén separados; los rodeos probados (leer cada uno desde su zona con el detector nativo, tapar el primero para buscar el segundo, partir el cuadro por la franja vacía) añadieron complejidad y cada QR se ve más pequeño en la cámara. Se retira la opción: un QR en pantalla y uno por cuadro en la lectura (SRS-001: FR-035 retirado).

## Qué se probó

| `IT-XX` | Planificado | Ejecutado | Desviación |
|---------|-------------|-----------|------------|
| IT-01 | Opción «QR a la vez» (orden directo e inverso) | Implementada en el emisor, con segunda marca en la barra y preferencia recordada | Ninguna |
| IT-02 | Lectura de ambos QR | Con `jsQR` no lee ningún QR; se probaron los tres rodeos | Se probó solo con `jsQR` y el detector nativo, que luego se descartaron (WI-003) |
| IT-03 | Informe | Este documento | Registro retrospectivo |

## Resultados por pregunta

| `Q-XX` | Criterio de éxito | Resultado observado | Resultado | Evidencia |
|--------|-------------------|---------------------|-----------|-----------|
| Q-01 | Ambos QR leídos en un cuadro | `jsQR` no lee ningún QR con dos en la imagen, aunque estén separados; solo funciona con rodeos | ❌ No cumple | Notas de las pruebas (2026-10-09) |
| Q-02 | Cada QR legible como uno único | Cada QR se ve más pequeño en la cámara; hay que acercarla o usar una pantalla amplia | ❌ No cumple | Notas de las pruebas (2026-10-09) |

## Hallazgos

El orden inverso garantiza cobertura en la mitad de pasos y cada fragmento aparece dos veces en momentos distintos; la idea es sólida si la lectura de dos QR por cuadro funcionara. La prueba no incluyó `zxing-wasm` (WI-003), que sí devuelve la posición del QR; una variante con él no se probó.

## Diagnóstico

La limitación es de la lectura en el receptor (`jsQR` con un único QR por imagen) y del tamaño aparente de cada QR en la cámara, no de la idea de cobertura. Se descarta por complejidad frente a su beneficio.

## Sustento del descarte

El resultado falla Q-01 y Q-02 con el lector vigente en la prueba, y los rodeos añaden lógica de lectura por zonas. Alternativa si se retoma: probar dos QR con `zxing-wasm` leyendo varios símbolos por imagen, y valorar corrección de errores hacia delante (diferida en el SRS-001, 2.6). No requiere ADR.

## Impacto en el artefacto / próximo paso

SRS-001: FR-035 retirado; se eliminan «QR a la vez», la segunda marca de la barra de posición y su preferencia recordada.
