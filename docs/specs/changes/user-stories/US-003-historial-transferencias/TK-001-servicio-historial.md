# TK-001: Servicio de historial: listado ordenado, filtro y eliminación

<!-- tk:status=Ready -->
**Estado:** Ready
**Historia:** [US-003](./README.md)
**Repositorio:** laboratorio-1
**Asignado a:** juanca202

## Descripción

Disponer de un servicio global que entregue el historial de transferencias (enviadas y recibidas) a partir del almacenamiento privado de la aplicación, ordenado del más reciente al más antiguo, con filtro por Todos, Recibidos o Enviados, y que permita eliminar una entrada borrando su archivo y su registro para liberar el espacio que ocupa. Solo lee y escribe en el almacenamiento privado.

## Dependencias

- Servicio de almacenamiento privado ([TK-002 de la US-001](../US-001-enviar-archivo-qr/TK-002-almacenamiento-copia-envio.md)) — registros y copias de archivos; esta tarea requiere que expongan listado, lectura y borrado, y si falta alguna operación se añade ahí
- Modelo del registro de transferencia almacenada (US-001) — dirección, nombre, tipo, tamaño y fecha
- Decorador `@Service` de Angular — servicio singleton
- Señales de Angular — estado del historial y del filtro

## Referencias

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
    │   └── + history-filter.ts             # Todos / Recibidos / Enviados
    └── services/
        ├── + transfer-history.ts           # historial ordenado, filtrado y eliminación
        └── + transfer-history.spec.ts      # pruebas con almacenamiento simulado
```

## Plan de implementación

- [x] **IT-01** — Definir el tipo del filtro (Todos, Recibidos, Enviados)
- [x] **IT-02** — Implementar el servicio de historial con el decorador `@Service`: carga de los registros del almacenamiento privado y orden del más reciente al más antiguo
- [x] **IT-03** — Aplicar el filtro por dirección sin alterar el orden
- [x] **IT-04** — Implementar la eliminación de una entrada: borra archivo y registro, y actualiza el historial
- [x] **IT-05** — Probar con almacenamiento simulado: orden con inserción desordenada, cada filtro, eliminación y espacio liberado, y que no haya accesos fuera del almacenamiento privado
- [x] **IT-06** — Documentar con TSDoc

## Observaciones

- Depende de que la tarea de almacenamiento de la US-001 esté implementada; las entradas recibidas las guarda la recepción (US-002) con el mismo registro.
- Regla de desempate para entradas con la misma fecha: no está especificada; basta con no perder ni duplicar entradas.
