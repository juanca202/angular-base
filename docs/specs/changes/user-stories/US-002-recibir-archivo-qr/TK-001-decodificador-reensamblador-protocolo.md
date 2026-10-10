# TK-001: Decodificador y reensamblador del protocolo de fragmentación

<!-- tk:status=Ready -->
**Estado:** Ready
**Historia:** [US-002](README.md)
**Repositorio:** laboratorio-1
**Asignado a:** juanca202

## Descripción

Disponer de un módulo puro que interprete los fragmentos del protocolo definido en [US-001](../US-001-enviar-archivo-qr/README.md): valide cada fragmento leído (versión, CRC32, coherencia de longitud), descarte los corruptos, inválidos o de otra transferencia, acepte los restantes en cualquier orden, ignore los repetidos, y al tener todos reconstruya el archivo y verifique su SHA-256 contra el de los metadatos. Devuelve de forma tipada los cuatro resultados posibles (completada, incompleta, datos inválidos, no reconstruible) y el avance (fragmentos recibidos del total). No depende de la interfaz, de la cámara ni de la librería de QR.

## Dependencias

- Protocolo de fragmentación de US-001 ([TK-001](../US-001-enviar-archivo-qr/TK-001-protocolo-fragmentacion-qr.md)) — constantes del formato, CRC32 y estructura del fragmento de metadatos y de datos
- Web Crypto (`crypto.subtle.digest`) — SHA-256 del archivo reconstruido
- `Uint8Array` / `DataView` / `Blob` — lectura binaria y ensamblado

## Referencias

- [Informe del spike WI-002](../../requirements/SRS-001-transferencia-qr/references/spike-report-WI-002-medicion-qr-android.md) (veredicto viable con trabajo; hallazgos y lagunas por tarea)
- **Referencia de lectura:** `spike/web/protocol.js` en la rama `spike/WI-002-medicion-qr-android` (receptor del protocolo v2; nunca para mergear ni copiar tal cual)
- **Arquitectura:** [ADR-001: arquitectura híbrida por capas y funcionalidades](../../../../adr/ADR-001-hybrid-layered-feature-architecture.md)
- **Arquitectura:** [ADR-002: modificadores de acceso explícitos y readonly](../../../../adr/ADR-002-explicit-member-accessibility-and-readonly.md)
- **Arquitectura:** [ADR-003: pruebas unitarias con Vitest y Testing Library](../../../../adr/ADR-003-unit-testing-vitest-testing-library.md)
- **Arquitectura:** [ADR-004: documentación con TSDoc](../../../../adr/ADR-004-tsdoc-documentation-during-development.md)
- **Diseño:** no aplica (módulo sin interfaz)

## Archivos afectados

```text
laboratorio-1/
└── src/app/shared/utils/qr-protocol/
    ├── + parse-fragment.ts            # valida y decodifica un fragmento leído
    ├── + parse-fragment.spec.ts
    ├── + fragment-assembler.ts        # acumula fragmentos, reconstruye y verifica
    ├── + fragment-assembler.spec.ts
    ├── + reception-result.ts          # resultado tipado: completada, incompleta, datos inválidos, no reconstruible
    └── ~ index.ts                     # exporta la API de recepción
```

## Plan de implementación

- [x] **IT-01** — Definir el resultado tipado de la recepción y el avance (recibidos, total)
- [x] **IT-02** — Implementar la decodificación de un fragmento con validación de versión, longitud y CRC32; descartar los inválidos sin lanzar errores
- [x] **IT-03** — Implementar el ensamblador: fijar la transferencia a partir de los metadatos, descartar fragmentos de otro identificador, aceptar desorden e ignorar repetidos
- [x] **IT-04** — Reconstruir el archivo al tener todos los fragmentos y verificar el SHA-256; distinguir «datos inválidos» (falla la verificación) de «no reconstruible» (metadatos inconsistentes)
- [x] **IT-05** — Exponer el resultado «incompleta» cuando se pide cerrar con fragmentos faltantes, conservando los válidos para seguir leyendo, y permitir reiniciar desde cero
- [x] **IT-06** — Probar con fragmentos corruptos, ajenos, desordenados, repetidos, hash alterado y metadatos inconsistentes; comprobar que el archivo reconstruido es idéntico byte a byte
- [x] **IT-07** — Documentar con TSDoc
