# Casos de prueba de US-002

| TC | Perspectiva | Tipo de prueba | Estado | Prioridad | Criterio de aceptación |
|----|-------------|----------------|--------|-----------|------------------------|
| [TC-001](TC-001-recibir-lee-qr-sin-fotos-happy.md) | Happy Path | E2E | Ready | Alta | AC-001 |
| [TC-002](TC-002-descarta-fragmentos-corruptos-error.md) | Error | Unit | Ready | Alta | AC-002 |
| [TC-003](TC-003-descarta-fragmentos-de-otra-transferencia-error.md) | Error | Unit | Ready | Alta | AC-002 |
| [TC-004](TC-004-acepta-fragmentos-en-desorden-happy.md) | Happy Path | Unit | Ready | Alta | AC-003 |
| [TC-005](TC-005-ignora-fragmentos-repetidos-limite.md) | Límite | Unit | Ready | Alta | AC-004 |
| [TC-006](TC-006-progreso-con-nombre-tamano-tiempo-happy.md) | Happy Path | E2E | Ready | Media | AC-005 |
| [TC-007](TC-007-progreso-minimo-en-movil-limite.md) | Límite | E2E | Ready | Baja | AC-005 |
| [TC-008](TC-008-reconstruye-verifica-y-libera-camara-happy.md) | Happy Path | Integration, E2E | Ready | Alta | AC-006 |
| [TC-009](TC-009-resultado-completada-happy.md) | Happy Path | Unit, E2E | Ready | Alta | AC-007 |
| [TC-010](TC-010-resultado-incompleta-error.md) | Error | Unit, E2E | Ready | Alta | AC-007 |
| [TC-011](TC-011-resultado-datos-invalidos-error.md) | Error | Unit | Ready | Alta | AC-007 |
| [TC-012](TC-012-resultado-no-reconstruible-error.md) | Error | Unit | Ready | Alta | AC-007 |
| [TC-013](TC-013-cancelar-recepcion-libera-camara-happy.md) | Happy Path | E2E | Ready | Alta | AC-008 |
| [TC-014](TC-014-guarda-con-nombre-y-tipo-originales-happy.md) | Happy Path | Integration | Ready | Alta | AC-009 |
| [TC-015](TC-015-mismo-nombre-no-sobrescribe-limite.md) | Límite | Integration | Ready | Alta | AC-009 |
| [TC-016](TC-016-previsualiza-imagen-y-abre-happy.md) | Happy Path | E2E | Ready | Media | AC-010 |
| [TC-017](TC-017-previsualiza-otro-tipo-con-icono-happy.md) | Happy Path | E2E | Ready | Media | AC-010 |
| [TC-018](TC-018-seguir-escaneando-tras-incompleta-happy.md) | Happy Path | Unit, E2E | Ready | Alta | AC-011 |
| [TC-019](TC-019-reintentar-desde-cero-tras-error-error.md) | Error | Unit, E2E | Ready | Alta | AC-011 |
| [TC-020](TC-020-sin-camara-o-permiso-denegado-error.md) | Error | E2E | Ready | Alta | AC-012 |
| [TC-021](TC-021-navegador-incompatible-recibir-error.md) | Error | E2E | Ready | Media | AC-012 |
| [TC-022](TC-022-cuota-agotada-al-guardar-recepcion-error.md) | Error | Integration | Ready | Alta | AC-012 |
| [TC-023](TC-023-archivo-identico-byte-a-byte-happy.md) | Happy Path | Unit, Integration | Ready | Alta | AC-013 |
| [TC-024](TC-024-svg-con-script-no-se-ejecuta-error.md) | Error | E2E | Ready | Alta | AC-014 |
| [TC-025](TC-025-cero-peticiones-de-red-en-recepcion-happy.md) | Happy Path | E2E | Ready | Alta | AC-015 |
| [TC-026](TC-026-recepcion-modo-avion-movil-happy.md) | Happy Path | Manual | Ready | Media | AC-016 |
| [TC-027](TC-027-recibir-operable-360-a-1280-limite.md) | Límite | E2E, Visual Test | Ready | Media | AC-017 |
| [TC-028](TC-028-error-no-guarda-ni-registra-error.md) | Error | Integration | Ready | Alta | AC-018 |
| [TC-029](TC-029-no-activa-hasta-confirmar-nombre-y-tamano-happy.md) | Happy Path | Unit | Ready | Alta | AC-019 |
| [TC-030](TC-030-descartar-transferencia-ignora-sus-fragmentos-error.md) | Error | Unit, E2E | Ready | Alta | AC-019 |
| [TC-031](TC-031-secuencia-ajena-en-cuadro-movil-error.md) | Error | Manual | Ready | Alta | AC-019 |
| [TC-032](TC-032-avance-y-aviso-visibles-antes-de-confirmar-happy.md) | Happy Path | E2E | Ready | Media | AC-020 |
| [TC-033](TC-033-no-inicia-lectura-mientras-hay-otra-error.md) | Error | Unit, E2E | Ready | Media | AC-021 |
| [TC-034](TC-034-funciona-en-chrome-android-happy.md) | Happy Path | Manual | Ready | Alta | AC-022 |
| [TC-035](TC-035-lectura-con-zxing-sin-barcodedetector-error.md) | Error | Integration | Ready | Media | AC-022 |
| [TC-036](TC-036-lectura-400b-m-30cm-9-de-10-happy.md) | Happy Path | Manual | Ready | Alta | AC-023 |
| [TC-037](TC-037-recepcion-1mb-en-15-minutos-happy.md) | Happy Path | Manual | Ready | Media | AC-024 |
| [TC-038](TC-038-solicita-almacenamiento-persistente-happy.md) | Happy Path | Integration | Ready | Baja | AC-025 |
| [TC-039](TC-039-recuadro-solo-sobre-el-qr-detectado-happy.md) | Happy Path | Unit, Manual | Ready | Media | AC-026 |
| [TC-040](TC-040-recuadro-se-mantiene-un-momento-y-se-borra-limite.md) | Límite | Unit | Ready | Baja | AC-026 |
| [TC-041](TC-041-lector-wasm-sin-conexion-happy.md) | Happy Path | E2E | Ready | Alta | AC-027 |
