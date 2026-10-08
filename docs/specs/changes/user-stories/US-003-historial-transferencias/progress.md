# Progreso

## US-003-historial-transferencias

<!-- work:id=US-003 · status=In Progress -->
**Estado:** In Progress
**Tipo:** historia de usuario
**Fecha de creación:** 2026-10-08 17:24
**Ultima actualizacion:** 2026-10-08 17:29

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

<!-- unit:id=TK-003 · status=Done -->
**Estado:** Done
**Iniciado:** 2026-10-08 17:28
**Finalizado:** 2026-10-08 17:29
**Implementador:** juanca202 / Claude / claude-sonnet-5-5

**Archivos:**
```
+ src/app/features/home/components/home-page.ts
+ src/app/features/home/components/home-page.html
+ src/app/features/home/components/home-page.spec.ts
+ src/app/features/home/components/history-list.ts
+ src/app/features/home/components/history-list.html
+ src/app/shared/utils/format-size.ts
+ src/app/shared/utils/format-size.spec.ts
~ src/app/app.routes.ts
~ src/app/core/services/file-export.ts
~ src/app/core/services/file-export.spec.ts
~ src/app/features/send/components/send-page.ts
```

**Notas:**
- Los nombres de los iconos de `ft-icon` (`upload`, `camera`, `download`, `share`, `trash`) no se pudieron verificar: el sprite `images/factoricons-regular.svg` no está en el repositorio. Todas las acciones llevan texto, así que la pantalla funciona aunque algún icono no exista; confirmarlos en la validación manual (TK-004).
- El aviso de presupuesto del bundle inicial subió de +5.84 kB a +20.83 kB tras esta tarea (home-page es un chunk diferido de 8 kB); conviene revisar qué entró en el bundle principal.
- La ruta `/recibir` aún no existe (la registrará US-002): hoy el botón Recibir lleva a la pantalla de error 404.
- Las pruebas de accesibilidad (AXE) y de ausencia de desplazamiento horizontal se hacen en los E2E de TK-004.

**Decisiones adicionales:**
- Se añadió `FileExport.isShareAvailable()` (TK-002) para que la pantalla decida si muestra Compartir sin tener que leer antes el archivo.
- Exportar siempre descarga; Compartir es una acción adicional que solo aparece si el navegador la ofrece (así TC-006 y TC-007 son verificables por separado).
- `formatSize` pasó a `shared/utils` y `send-page` lo reutiliza para no duplicarlo.
- Con entradas pero un filtro sin resultados se muestra «No hay transferencias en este filtro»; «Aún no hay transferencias» queda para el historial realmente vacío.
- La confirmación de eliminar usa `confirm()` del puente de notificaciones (ADR-009), con acciones Eliminar / Cancelar.

**Cobertura de test cases:**
- TC-001, TC-003, TC-004, TC-005, TC-006, TC-010, TC-012, TC-015 y TC-016 son E2E o de pantalla: aquí se cubren con pruebas de componente (Testing Library) y los E2E se escriben en TK-004.
- TC-007 y TC-008 (compartir) son manuales por diseño.

### TK-004: Validación manual y escenarios E2E del historial

<!-- unit:id=TK-004 · status=Pending -->
**Estado:** Pending
