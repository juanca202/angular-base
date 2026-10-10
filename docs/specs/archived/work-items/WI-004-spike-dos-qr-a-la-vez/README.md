# WI-004: Mostrar y leer dos QR a la vez para acelerar la transferencia

<!-- wi:status=Ready · type=spike -->
**Estado:** Ready
**Tipo:** spike
**Subtipo:** funcional
**Repositorio:** laboratorio-1
**Origen:** [SRS-001: Transferencia de archivos mediante secuencia de QR](../../../changes/requirements/SRS-001-transferencia-qr/README.md) (FR-035, retirado), [US-001](../../../changes/user-stories/US-001-enviar-archivo-qr/README.md), [US-002](../../../changes/user-stories/US-002-recibir-archivo-qr/README.md)
**Timebox:** Sin timebox formal: registro retrospectivo de una prueba hecha durante la implementación (2026-10-09)
**Resolución:** Descartado — FR-035 retirado en el SRS-001; el emisor muestra siempre un QR y el receptor lee uno por cuadro

## Pregunta de investigación

¿Se puede reducir el tiempo de la transferencia mostrando dos QR a la vez (uno en orden y otro desde el final) y leyendo ambos en un mismo cuadro con un móvil Android?

## Contexto

Tras las pruebas del 2026-10-08, el usuario propuso mostrar dos QR para completar antes los fragmentos que se pierden. Se eligió el orden inverso porque garantiza cobertura en la mitad de pasos y cada fragmento aparece dos veces en momentos distintos, frente al orden aleatorio (repetidos y huecos).

## Hipótesis

Creemos que mostrar dos QR a la vez y leer los dos por cuadro reduce el tiempo por vuelta a la mitad porque cada cuadro aporta dos fragmentos.

## Preguntas a responder

- **Q-01 (Viabilidad):** ¿Lee el receptor ambos QR cuando hay dos en la imagen?
  - **Éxito:** ambos QR se leen en el mismo cuadro con la lectura vigente.
  - **Fallo:** no se lee ninguno o solo se lee con rodeos que degradan la lectura.
- **Q-02 (Comportamiento):** ¿Sigue siendo legible cada QR en pantalla compartida?
  - **Éxito:** cada QR se lee con la misma tasa que un QR único.
  - **Fallo:** hay que acercar la cámara o usar una pantalla mayor.

## Fuera de alcance

- Corrección de errores hacia delante y códigos de fuente (fuera de alcance en el SRS-001, 1.2).
- El código producido **no se integra**: se implementó en `main` (commit `b8d3911`) y se retiró (`ddcaaab`, `563e877`); no hubo rama `spike/`.

## Dependencias

- Móvil Android con Chrome y laptop como emisor.
- Lector de QR vigente en la prueba: `jsQR` con el detector nativo.

## Referencias

- **Spike relacionado:** [WI-003](../../../changes/requirements/SRS-001-transferencia-qr/references/spike-report-WI-003-lectura-qr-android.md).
- **Diseño:** [WF-002](../../../changes/requirements/SRS-001-transferencia-qr/wireframes/WF-002-enviar-seleccion.md).

## Enfoque del experimento

- [x] **IT-01** — Añadir la opción «QR a la vez» al emisor: un QR en orden y otro desde el final.
- [x] **IT-02** — Leer ambos QR en el receptor con `jsQR` y el detector nativo.
- [x] **IT-03** — Redactar `spike-report.md`.

## Entregable

- [`spike-report.md`](../../../changes/requirements/SRS-001-transferencia-qr/references/spike-report-WI-004-dos-qr-a-la-vez.md) con veredicto y marca oculta `spike:verdict`.
- Sin evidencia en `assets/` ni rama de referencia.

## Observaciones

- Registro retrospectivo: no hay mediciones en bruto, solo las observaciones de la prueba.
