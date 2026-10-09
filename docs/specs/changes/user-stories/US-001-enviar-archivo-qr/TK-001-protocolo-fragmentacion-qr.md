# TK-001: Protocolo de fragmentación versionado para la secuencia de QR

<!-- tk:status=Ready -->
**Estado:** Ready
**Historia:** [US-001](./README.md)
**Repositorio:** laboratorio-1
**Asignado a:** juanca202

## Descripción

Disponer de un módulo puro y versionado que convierta un archivo en la lista de fragmentos que se codificarán como QR: fragmento de metadatos (nombre, tipo, tamaño y hash SHA-256 del archivo completo) más fragmentos de datos de 1600 B por defecto, cada uno con identificador de transferencia, posición, total, número de versión del formato y verificación propia (CRC32). El módulo no depende de la interfaz, de la cámara ni de la librería de QR, y rechaza archivos que requieran más fragmentos de los que admite el formato.

## Dependencias

- Web Crypto (`crypto.subtle.digest`) — hash SHA-256 del archivo y generación del identificador de transferencia
- `Uint8Array` / `DataView` — armado binario del fragmento
- Constantes del formato (versión, tamaño de cabecera, tamaño de datos por defecto, máximo de fragmentos) — en un único archivo de constantes del módulo

## Referencias

- [Informe del spike WI-002](../../../archived/work-items/WI-002-spike-medicion-qr-android/spike-report.md) (veredicto viable con trabajo; hallazgos y lagunas por tarea)
- **Referencia de lectura:** `spike/web/protocol.js` en la rama `spike/WI-002-medicion-qr-android` (protocolo v2 del spike; nunca para mergear ni copiar tal cual)
- **Arquitectura:** [ADR-001: arquitectura híbrida por capas y funcionalidades](../../../../adr/ADR-001-hybrid-layered-feature-architecture.md)
- **Arquitectura:** [ADR-002: modificadores de acceso explícitos y readonly](../../../../adr/ADR-002-explicit-member-accessibility-and-readonly.md)
- **Arquitectura:** [ADR-003: pruebas unitarias con Vitest y Testing Library](../../../../adr/ADR-003-unit-testing-vitest-testing-library.md)
- **Arquitectura:** [ADR-004: documentación con TSDoc](../../../../adr/ADR-004-tsdoc-documentation-during-development.md)
- **Diseño:** no aplica (módulo sin interfaz)

## Archivos afectados

```text
laboratorio-1/
└── src/app/shared/utils/qr-protocol/
    ├── + constants.ts                 # versión, cabecera, 1600 B por defecto, máximo de fragmentos
    ├── + crc32.ts                     # CRC32 de un fragmento
    ├── + fragment-file.ts             # fragmenta un archivo en metadatos + datos
    ├── + fragment-file.spec.ts        # pruebas de unidad
    ├── + crc32.spec.ts                # pruebas de unidad
    └── + index.ts                     # API pública del módulo
```

## Plan de implementación

- [x] **IT-01** — Definir las constantes del formato (versión, cabecera, datos por defecto de 1600 B, máximo de fragmentos)
- [x] **IT-02** — Implementar el CRC32 con pruebas
- [x] **IT-03** — Implementar la fragmentación: fragmento de metadatos (nombre, tipo, tamaño, SHA-256) y fragmentos de datos con cabecera completa
  Cada fragmento lleva identificador de transferencia, posición, total, versión, longitud, carga y CRC32; el identificador es aleatorio por transferencia.
- [x] **IT-04** — Validar el límite de fragmentos y devolver un error tipado cuando un archivo lo excede; aceptar el tamaño de datos como parámetro con 1600 B por defecto
- [x] **IT-05** — Probar que el módulo corre sin DOM ni cámara y que recuperar nombre, tipo y hash desde los metadatos da los valores originales
- [x] **IT-06** — Documentar la API pública con TSDoc y exportarla desde `index.ts`
