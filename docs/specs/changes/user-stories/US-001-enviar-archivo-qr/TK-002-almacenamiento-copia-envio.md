# TK-002: Servicio de almacenamiento privado para la copia del archivo enviado

<!-- tk:status=Ready -->
**Estado:** Ready
**Historia:** [US-001](README.md)
**Repositorio:** laboratorio-1
**Asignado a:** juanca202

## Descripción

Disponer de un servicio global que guarde una copia del archivo enviado en el almacenamiento privado de la aplicación (OPFS) junto con un registro mínimo (identificador, dirección, nombre, tipo, tamaño y fecha), de modo que el historial pueda mostrarla, y que informe con un error tipado cuando la cuota de almacenamiento se agota. Expone también una operación para solicitar almacenamiento persistente.

## Dependencias

- Origin Private File System (`navigator.storage.getDirectory`) — archivos y registro de metadatos
- `navigator.storage.estimate` / `persist` — cuota y persistencia
- Decorador `@Service` de Angular — servicio singleton

## Referencias

- [Informe del spike WI-002](../../requirements/SRS-001-transferencia-qr/references/spike-report-WI-002-medicion-qr-android.md) (veredicto viable con trabajo; hallazgos y lagunas por tarea)
- **Arquitectura:** [ADR-001: arquitectura híbrida por capas y funcionalidades](../../../../adr/ADR-001-hybrid-layered-feature-architecture.md)
- **Arquitectura:** [ADR-015: decorador `@Service` para singletons](../../../../adr/ADR-015-service-decorator-for-singletons.md)
- **Arquitectura:** [ADR-002: modificadores de acceso explícitos y readonly](../../../../adr/ADR-002-explicit-member-accessibility-and-readonly.md)
- **Arquitectura:** [ADR-003: pruebas unitarias con Vitest y Testing Library](../../../../adr/ADR-003-unit-testing-vitest-testing-library.md)
- **Arquitectura:** [ADR-004: documentación con TSDoc](../../../../adr/ADR-004-tsdoc-documentation-during-development.md)

## Archivos afectados

```text
laboratorio-1/
└── src/app/core/
    ├── models/
    │   └── + stored-transfer.ts            # registro: id, dirección, nombre, tipo, tamaño, fecha
    └── services/
        ├── + private-storage.ts            # guarda, lee y lista copias; pide persistencia
        ├── + private-storage.spec.ts       # pruebas con un doble de OPFS
        └── + storage-quota-error.ts        # error tipado de cuota agotada
```

## Plan de implementación

- [x] **IT-01** — Definir el modelo del registro de una transferencia almacenada
- [x] **IT-02** — Implementar el guardado de la copia (archivo y registro) en OPFS con el decorador `@Service`
- [x] **IT-03** — Detectar la cuota agotada (estimación previa y errores de escritura) y lanzar el error tipado sin dejar archivos a medias
- [x] **IT-04** — Exponer lectura y listado de copias para el historial y la operación de solicitar almacenamiento persistente
- [x] **IT-05** — Probar con un doble de OPFS: guardado correcto, cuota agotada y limpieza de la escritura incompleta
- [x] **IT-06** — Documentar con TSDoc
