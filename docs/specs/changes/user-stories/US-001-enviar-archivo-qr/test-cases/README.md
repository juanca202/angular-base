# Casos de prueba de US-001

| TC | Perspectiva | Tipo de prueba | Estado | Prioridad | Criterio de aceptación |
|----|-------------|----------------|--------|-----------|------------------------|
| [TC-001](TC-001-enviar-abre-selector-happy.md) | Happy Path | E2E | Ready | Alta | AC-001 |
| [TC-002](TC-002-selector-cerrado-sin-elegir-error.md) | Error | E2E | Ready | Media | AC-001 |
| [TC-003](TC-003-no-permite-varios-archivos-error.md) | Error | E2E | Ready | Media | AC-002 |
| [TC-004](TC-004-muestra-qr-e-informacion-happy.md) | Happy Path | E2E | Ready | Alta | AC-003 |
| [TC-005](TC-005-tiempo-estimado-calculando-limite.md) | Límite | E2E | Ready | Baja | AC-003 |
| [TC-006](TC-006-fragmentos-con-cabecera-completa-happy.md) | Happy Path | Unit | Ready | Alta | AC-004 |
| [TC-007](TC-007-metadatos-nombre-y-tipo-happy.md) | Happy Path | Unit | Ready | Alta | AC-005 |
| [TC-008](TC-008-archivo-mayor-que-un-qr-happy.md) | Happy Path | Unit, Integration | Ready | Alta | AC-006 |
| [TC-009](TC-009-velocidad-automatica-sin-intervencion-happy.md) | Happy Path | E2E | Ready | Alta | AC-007 |
| [TC-010](TC-010-bucle-continuo-tras-tres-vueltas-happy.md) | Happy Path | E2E | Ready | Alta | AC-008 |
| [TC-011](TC-011-cancelar-envio-sin-confirmacion-happy.md) | Happy Path | E2E | Ready | Alta | AC-009 |
| [TC-012](TC-012-copia-en-historial-al-iniciar-happy.md) | Happy Path | Integration, E2E | Ready | Media | AC-010 |
| [TC-013](TC-013-archivo-vacio-no-inicia-error.md) | Error | Unit, E2E | Ready | Alta | AC-011 |
| [TC-014](TC-014-cuota-agotada-al-guardar-copia-error.md) | Error | Integration | Ready | Alta | AC-011 |
| [TC-015](TC-015-navegador-incompatible-error.md) | Error | E2E | Ready | Media | AC-011 |
| [TC-016](TC-016-cero-peticiones-de-red-en-envio-happy.md) | Happy Path | E2E | Ready | Alta | AC-012 |
| [TC-017](TC-017-envio-sin-conexion-happy.md) | Happy Path | E2E | Ready | Alta | AC-013 |
| [TC-018](TC-018-envio-modo-avion-movil-happy.md) | Happy Path | Manual | Ready | Media | AC-013 |
| [TC-019](TC-019-protocolo-sin-interfaz-con-version-happy.md) | Happy Path | Unit | Ready | Alta | AC-014 |
| [TC-020](TC-020-envio-operable-360-a-1280-limite.md) | Límite | E2E, Visual Test | Ready | Media | AC-015 |
| [TC-021](TC-021-fragmento-por-defecto-1600b-m-happy.md) | Happy Path | Unit | Ready | Alta | AC-016 |
| [TC-022](TC-022-serie-10-lecturas-para-tamano-mayor-limite.md) | Límite | Manual | Ready | Media | AC-016 |
| [TC-023](TC-023-1mb-en-15-minutos-happy.md) | Happy Path | Manual | Ready | Media | AC-017 |
| [TC-024](TC-024-archivo-excede-maximo-de-fragmentos-limite.md) | Límite | Unit, E2E | Ready | Media | AC-018 |
| [TC-025](TC-025-metadatos-incluyen-sha256-happy.md) | Happy Path | Unit | Ready | Alta | AC-019 |
