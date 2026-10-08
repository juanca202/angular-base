# Progreso

## WI-001-spike-protocolo-transferencia-qr

<!-- work:id=WI-001 · status=Done -->
**Estado:** Done
**Tipo:** tarea de mantenimiento (spike)
**Fecha de creación:** 2026-10-08
**Última actualización:** 2026-10-08

## Unidades

### WI-001: Viabilidad del protocolo de transferencia por secuencia de QR

<!-- unit:id=WI-001 · status=Done -->
**Estado:** Done
**Iniciado:** 2026-10-08
**Finalizado:** 2026-10-08
**Implementador:** juanca202 / Claude / claude-sonnet-5-5

**Archivos:**
```
+ spike/package.json
+ spike/.gitignore
+ spike/protocol.mjs
+ spike/qrsim.mjs
+ spike/exp-capacity.mjs
+ spike/exp-protocol.mjs
+ docs/specs/changes/work-items/WI-001-spike-protocolo-transferencia-qr/assets/EV-01-capacidad-por-qr.json
+ docs/specs/changes/work-items/WI-001-spike-protocolo-transferencia-qr/assets/EV-02-protocolo-y-modelo.json
+ docs/specs/changes/work-items/WI-001-spike-protocolo-transferencia-qr/spike-report.md
+ docs/specs/changes/work-items/WI-001-spike-protocolo-transferencia-qr/progress.md
~ docs/specs/changes/work-items/WI-001-spike-protocolo-transferencia-qr/README.md
```

**Notas:**
- Timebox consumido: una sesión (< 1 día de los 2 planificados). Veredicto: INCONCLUSIVE.
- Sin cámara física ni móviles Android: las Q que dependen de ellas (capacidad estable, velocidad, APIs de Chrome Android, PWA sin red) no se pudieron medir.

**Decisiones adicionales:**
- El usuario decidió cerrar el spike «solo con lo automatizable» (prototipo y mediciones en Node/simulación) y marcar las Q de cámara como no concluyentes.
- El prototipo se hizo en Node (`qrcode` + `jsqr`) en `spike/` y no dentro de la app Angular, para no tocar el código de producción.
