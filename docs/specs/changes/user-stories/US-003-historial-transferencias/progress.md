# Progreso

## US-003-historial-transferencias

<!-- work:id=US-003 · status=In Progress -->
**Estado:** In Progress
**Tipo:** historia de usuario
**Fecha de creación:** 2026-10-08 17:24
**Ultima actualizacion:** 2026-10-08 17:26

## Unidades

### TK-001: Servicio de historial: listado ordenado, filtro y eliminación

<!-- unit:id=TK-001 · status=Done -->
**Estado:** Done
**Iniciado:** 2026-10-08 17:24
**Finalizado:** 2026-10-08 17:25
**Implementador:** juanca202 / Claude / claude-sonnet-5-5

**Archivos:**
```
+ src/app/core/models/history-filter.ts
+ src/app/core/services/transfer-history.ts
+ src/app/core/services/transfer-history.spec.ts
~ src/app/core/services/private-storage.ts
~ src/app/core/services/private-storage.spec.ts
```

**Notas:**
- Las entradas «recibidas» se prueban solo con datos simulados: las recepciones de US-002 aún no están integradas en `main`.
- `PrivateStorage.list()` falla entero si un registro está corrupto (hallazgo menor del code-review de US-001); no se trató aquí.

**Decisiones adicionales:**
- Se añadió `remove(id)` a `PrivateStorage` (US-001), como preveía el TK; es idempotente si el registro no existe.
- La rama parte de `main` (US-001 integrada) y no de US-002, que sigue sin integrar.
- Desempate de entradas con la misma fecha: no se define un orden; el test solo exige no perder ni duplicar entradas (como indica el TK).

**Cobertura de test cases:**
- TC-001, TC-003, TC-004 y TC-005 son E2E y se automatizan en TK-004; aquí se cubren sus reglas con pruebas unitarias del servicio.
- TC-010 a TC-012 (eliminar) se cubren a nivel de servicio; la confirmación previa es de la pantalla (TK-003).

### TK-002: Servicio de exportación

<!-- unit:id=TK-002 · status=Done -->
**Estado:** Done
**Iniciado:** 2026-10-08 17:26
**Finalizado:** 2026-10-08 17:26
**Implementador:** juanca202 / Claude / claude-sonnet-5-5

**Archivos:**
```
+ src/app/core/services/file-export.ts
+ src/app/core/services/file-export.spec.ts
```

**Notas:**
- El servicio recibe un `File`; la pantalla (TK-003) lo obtiene con `PrivateStorage.read(id)`.
- Exportar por descarga y compartir con otras apps se verifica aquí con dobles; compartir en un móvil real es manual (TK-004).

**Decisiones adicionales:**
- Saneamiento de nombres (pendiente en el TK): no se modifica ningún carácter; se exporta el nombre original tal cual. Los nombres duplicados los resuelve el navegador al descargar. El caso de nombres especiales (TC-009) no necesita ajuste.

**Cobertura de test cases:**
- TC-006, TC-007, TC-008, TC-009 y TC-014: los E2E y manuales se completan en TK-004; aquí se cubren sus reglas con pruebas unitarias del servicio.

### TK-003: Pantalla de inicio e historial

<!-- unit:id=TK-003 · status=Pending -->
**Estado:** Pending

### TK-004: Validación manual y escenarios E2E del historial

<!-- unit:id=TK-004 · status=Pending -->
**Estado:** Pending
