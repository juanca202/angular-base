# TK-002: Guardado del archivo recibido en el almacenamiento privado

<!-- tk:status=Ready -->
**Estado:** Ready
**Historia:** [US-002](README.md)
**Repositorio:** laboratorio-1
**Asignado a:** juanca202

## Descripción

Disponer de la operación de recepción que guarde el archivo reconstruido, con su nombre y tipo originales, en el almacenamiento privado de la aplicación sin solicitar permisos de carpeta y sin sobrescribir un archivo existente con el mismo nombre. Registra la transferencia como recibida para el historial, avisa con el error tipado de cuota cuando el almacenamiento se agota (sin dejar nada guardado ni registrado) y solicita almacenamiento persistente al guardar.

## Dependencias

- Servicio de almacenamiento privado de US-001 ([TK-002](../US-001-enviar-archivo-qr/TK-002-almacenamiento-copia-envio.md)) — guardado en OPFS, registro, error de cuota y solicitud de persistencia
- Modelo de registro de transferencia almacenada de US-001 ([TK-002](../US-001-enviar-archivo-qr/TK-002-almacenamiento-copia-envio.md)) — dirección «recibido»
- Decorador `@Service` de Angular — servicio singleton

## Referencias

- [Informe del spike WI-002](../../requirements/SRS-001-transferencia-qr/references/spike-report-WI-002-medicion-qr-android.md) (veredicto viable con trabajo; hallazgos y lagunas por tarea)
- **Arquitectura:** [ADR-001: arquitectura híbrida por capas y funcionalidades](../../../../adr/ADR-001-hybrid-layered-feature-architecture.md)
- **Arquitectura:** [ADR-015: decorador `@Service` para singletons](../../../../adr/ADR-015-service-decorator-for-singletons.md)
- **Arquitectura:** [ADR-002: modificadores de acceso explícitos y readonly](../../../../adr/ADR-002-explicit-member-accessibility-and-readonly.md)
- **Arquitectura:** [ADR-003: pruebas unitarias con Vitest y Testing Library](../../../../adr/ADR-003-unit-testing-vitest-testing-library.md)
- **Arquitectura:** [ADR-004: documentación con TSDoc](../../../../adr/ADR-004-tsdoc-documentation-during-development.md)
- **Diseño:** no aplica (servicio sin interfaz)

## Archivos afectados

```text
laboratorio-1/
└── src/app/features/receive/
    └── services/
        ├── + received-file-saver.ts        # nombre único, guardado, registro y persistencia
        └── + received-file-saver.spec.ts   # pruebas con almacenamiento simulado
```

## Plan de implementación

- [x] **IT-01** — Resolver un nombre que no sobrescriba un archivo existente conservando el original para mostrarlo y exportarlo
- [x] **IT-02** — Guardar el archivo reconstruido y su registro como recibido usando el servicio de almacenamiento privado, con el tipo original
- [x] **IT-03** — Propagar el error de cuota agotada sin dejar archivo ni registro, y conservar el archivo recibido en memoria para que la pantalla pueda ofrecer su descarga
- [x] **IT-04** — Solicitar almacenamiento persistente tras un guardado correcto sin que su rechazo bloquee el guardado
- [x] **IT-05** — Probar guardado con nombre y tipo originales, mismo nombre sin sobrescribir, cuota agotada y solicitud de persistencia
- [x] **IT-06** — Documentar con TSDoc
