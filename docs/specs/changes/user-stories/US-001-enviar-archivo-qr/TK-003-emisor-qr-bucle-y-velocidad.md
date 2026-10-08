# TK-003: Emisor de QR: generación, bucle y velocidad fija de 8 fps

<!-- tk:status=Ready -->
**Estado:** Ready
**Historia:** [US-001](./README.md)
**Repositorio:** laboratorio-1
**Asignado a:** juanca202

## Descripción

Disponer del orquestador que, a partir de los fragmentos del protocolo, genera un QR por fragmento con la librería `qrcode` (corrección M), los emite de forma secuencial a una velocidad fija de 8 fotogramas por segundo sin intervención del usuario, repite la secuencia en bucle hasta que se cancele, y libera sus recursos al cancelar. Expone el número de QR, la vuelta actual y el tiempo estimado por vuelta.

## Dependencias

- Módulo de protocolo (tarea TK-001) — lista de fragmentos
- Librería `qrcode` (npm) — generación de la matriz de módulos del QR en modo binario
- Signals de Angular — estado de la emisión (fragmento actual, vuelta, activa)
- Temporizador del navegador — cadencia de 8 fps con corrección de deriva

## Referencias

- [Informe del spike WI-002](../../../archived/work-items/WI-002-spike-medicion-qr-android/spike-report.md) (veredicto viable con trabajo; hallazgos y lagunas por tarea)
- **Referencia de lectura:** `spike/web/protocol.js` en la rama `spike/WI-002-medicion-qr-android` (protocolo v2 del spike; nunca para mergear ni copiar tal cual)
- **Arquitectura:** [ADR-001: arquitectura híbrida por capas y funcionalidades](../../../../adr/ADR-001-hybrid-layered-feature-architecture.md)
- **Arquitectura:** [ADR-011: patrón Manager para orquestación](../../../../adr/ADR-011-manager-pattern-orchestration.md)
- **Arquitectura:** [ADR-003: pruebas unitarias con Vitest y Testing Library](../../../../adr/ADR-003-unit-testing-vitest-testing-library.md)
- **Arquitectura:** [ADR-004: documentación con TSDoc](../../../../adr/ADR-004-tsdoc-documentation-during-development.md)
- **Arquitectura:** [ADR-002: modificadores de acceso explícitos y readonly](../../../../adr/ADR-002-explicit-member-accessibility-and-readonly.md)

## Archivos afectados

```text
laboratorio-1/
├── ~ package.json                                  # añade la dependencia qrcode
└── src/app/features/send/
    ├── services/
    │   ├── + qr-encoder.ts                         # fragmento -> matriz QR (corrección M)
    │   ├── + qr-encoder.spec.ts
    │   ├── + send-sequence-manager.ts              # bucle, cancelación y estado de la emisión
    │   └── + send-sequence-manager.spec.ts
    └── models/
        └── + send-progress.ts                      # fragmento, vuelta, total, tiempo por vuelta
```

## Plan de implementación

- [x] **IT-01** — Añadir `qrcode` como dependencia y verificar que codifica carga binaria
- [x] **IT-02** — Implementar el codificador de fragmento a matriz de QR con corrección M
- [x] **IT-03** — Implementar el manager de la secuencia: emisión secuencial a 8 fps fija, bucle continuo y cancelación que libera recursos
  Mostrar «calculando…» como tiempo estimado hasta tener datos suficientes; luego número de QR × tiempo por fotograma.
- [x] **IT-04** — Exponer el estado de la emisión (fragmento actual, vuelta, total, tiempo estimado por vuelta) como signals
- [x] **IT-05** — Probar con temporizadores simulados: avance sin intervención, repetición tras tres vueltas, cancelación y estimación
- [x] **IT-06** — Documentar con TSDoc

## Observaciones

- La velocidad de 8 fps está decidida pero no validada con cámara: queda cubierta por la tarea de validación manual (TK-006).
- El criterio de la historia que fija el tiempo de 1 MB es un objetivo DEBERÍA; con 400 B por fragmento y 8 fps el modelo del spike da unos 23 minutos con un 90 % de lectura por vuelta.
