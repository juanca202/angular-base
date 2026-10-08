# TK-004: Gestor de la recepción: estados, confirmación y resultados

<!-- tk:status=Ready -->
**Estado:** Ready
**Historia:** [US-002](./README.md)
**Repositorio:** laboratorio-1
**Asignado a:** juanca202

## Descripción

Disponer del orquestador que une el lector de cámara, el ensamblador y el guardado en un único flujo de recepción observable por la interfaz: espera el primer QR, mantiene el avance (nombre, tamaño, fragmentos recibidos del total, porcentaje y tiempo estimado restante) incluso antes de confirmar, pide confirmar o descartar la transferencia al leer sus metadatos, y no la da por activa hasta confirmarla. Al descartarla ignora sus fragmentos. Al reunir todos los fragmentos reconstruye, verifica, libera la cámara y solo entonces guarda y declara «completada»; con «incompleta» (al terminar la lectura), «datos inválidos» o «no reconstruible» no guarda ni registra nada. Permite cancelar en cualquier momento, seguir escaneando tras «incompleta» conservando los fragmentos válidos y reintentar desde cero tras un error, sin persistir fragmentos parciales.

## Dependencias

- Decodificador y reensamblador ([TK-001](./TK-001-decodificador-reensamblador-protocolo.md)) — fragmentos, resultados y avance
- Guardado del archivo recibido ([TK-002](./TK-002-guardado-archivo-recibido.md)) — persistencia y error de cuota
- Lector de QR con cámara ([TK-003](./TK-003-lector-camara-qr.md)) — QR leídos y errores de cámara
- Signals de Angular — estado observable por la interfaz

## Referencias

- [Informe del spike WI-002](../../../archived/work-items/WI-002-spike-medicion-qr-android/spike-report.md) (veredicto viable con trabajo; hallazgos y lagunas por tarea)
- **Diseño:** [WF-004: Recibir: escaneo e información](../../requirements/SRS-001-transferencia-qr/wireframes/WF-004-recibir-escaneo.md) — Aprobado ([SVG](../../requirements/SRS-001-transferencia-qr/wireframes/WF-004-recibir-escaneo.svg), [móvil](../../requirements/SRS-001-transferencia-qr/wireframes/WF-004-recibir-escaneo-movil.svg))
- **Arquitectura:** [ADR-001: arquitectura híbrida por capas y funcionalidades](../../../../adr/ADR-001-hybrid-layered-feature-architecture.md)
- **Arquitectura:** [ADR-011: patrón Manager para orquestación](../../../../adr/ADR-011-manager-pattern-orchestration.md)
- **Arquitectura:** [ADR-002: modificadores de acceso explícitos y readonly](../../../../adr/ADR-002-explicit-member-accessibility-and-readonly.md)
- **Arquitectura:** [ADR-003: pruebas unitarias con Vitest y Testing Library](../../../../adr/ADR-003-unit-testing-vitest-testing-library.md)
- **Arquitectura:** [ADR-004: documentación con TSDoc](../../../../adr/ADR-004-tsdoc-documentation-during-development.md)

## Archivos afectados

```text
laboratorio-1/
└── src/app/features/receive/
    ├── models/
    │   └── + receive-state.ts                      # estado, avance, transferencia pendiente de confirmar y resultado
    └── services/
        ├── + receive-manager.ts                    # orquesta cámara, ensamblado, confirmación y guardado
        └── + receive-manager.spec.ts
```

## Plan de implementación

- [ ] **IT-01** — Definir el modelo de estado de la recepción (esperando, leyendo, esperando confirmación, resultado) y el avance con tiempo estimado restante
- [ ] **IT-02** — Iniciar y detener la lectura delegando en el lector de cámara y propagando sus errores sin iniciar la recepción
- [ ] **IT-03** — Alimentar el ensamblador con cada QR leído y actualizar el avance, también mientras se espera la confirmación
- [ ] **IT-04** — Exponer la transferencia pendiente (nombre y tamaño) y resolver Confirmar o Descartar; no completar ni guardar nada antes de confirmar, e ignorar los fragmentos de una transferencia descartada
- [ ] **IT-05** — Al reunir todos los fragmentos: reconstruir, verificar, liberar la cámara y solo entonces guardar y declarar «completada»; propagar el aviso de cuota agotada sin registrar
- [ ] **IT-06** — Resolver «incompleta» al terminar la lectura, «datos inválidos» y «no reconstruible» sin guardar ni registrar
- [ ] **IT-07** — Implementar cancelar sin confirmación (detiene, descarta parciales y libera la cámara), seguir escaneando tras «incompleta» y reintentar desde cero tras un error; sin persistir parciales
- [ ] **IT-08** — Probar el flujo completo con dobles: confirmación y descarte, los cuatro resultados, cancelación, continuar y reintentar, y que no se guarda en los casos de error
- [ ] **IT-09** — Documentar con TSDoc
