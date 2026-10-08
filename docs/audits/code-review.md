# Code Review — US-003-historial-transferencias

**Fecha:** 2026-10-08 17:37
**Rama:** feature/US-003-historial-transferencias
**Commit:** 17af4c1
**Alcance del diff:** rama contra `main` (incluye lo no commiteado) — servicio de historial, exportación, pantalla de inicio y E2E
**Modo:** default
**Base del diff:** main @ 82421b3
**Veredicto:** ✅ Aprobado — cero hallazgos bloqueantes; tres hallazgos menores.

## Resumen

Capas bien separadas: `TransferHistory` y `FileExport` son servicios singleton con `@Service`, `HistoryList` es presentacional (solo emite acciones) y `HomePage` orquesta, con las confirmaciones y avisos a través del puente de notificaciones (ADR-009). Las pruebas cubren los comportamientos de los criterios y los errores. Se anotan tres mejoras menores.

## Intención detectada

Fuente: [US-003](../specs/changes/user-stories/US-003-historial-transferencias/README.md) (historial ordenado, filtros, exportar, eliminar con confirmación, almacenamiento privado, sin desplazamiento horizontal, estado vacío). El diff implementa todos los criterios; las pruebas manuales con móvil quedaron sin ejecutar por decisión del usuario.

## Hallazgos

Leyenda de severidad: `🔴` Crítico · `🟠` Mayor · `🟡` Menor · `💡` Sugerencia · `✅` Sin hallazgos.

### Análisis semántico (intención)

✅ Sin hallazgos. Una diferencia consciente con el caso de prueba: TC-007 habla de «Exportar y elegir compartir» y la interfaz separa Exportar (descarga) y Compartir; queda anotado en el `progress.md`.

### Arquitectura y diseño

🟡 **Fiabilidad — la URL de objeto se libera inmediatamente tras `click()`** ([file-export.ts](../../src/app/core/services/file-export.ts)). Funciona en Chromium (cubierto por E2E), pero otros navegadores pueden cancelar la descarga si la URL se revoca antes de que empiece. Sugerencia: revocarla en un `setTimeout` corto.

🟡 **Usabilidad — si falla la carga del historial se muestra «Aún no hay transferencias»** ([home-page.ts](../../src/app/features/home/components/home-page.ts)). Además del aviso de error, la pantalla marca `loaded` y parece un historial vacío. Sugerencia: no mostrar el estado vacío cuando la carga falló.

🟡 **Fiabilidad — `PrivateStorage.list()` falla entero ante un registro corrupto** ([private-storage.ts](../../src/app/core/services/private-storage.ts)). Ya anotado en la revisión de US-001; ahora el historial depende de ello. Sugerencia: omitir los registros ilegibles.

### Feedback adicional

- El aviso de presupuesto del bundle inicial subió unos 15 kB con esta rama aunque `home-page` es un chunk diferido: conviene averiguar qué entró en el bundle principal.
- Los nombres de icono de `ft-icon` no se pudieron verificar contra el sprite.

## Próximas acciones

Sin acciones bloqueantes.

<!-- code-review:verdict=APPROVED · mode=default · fingerprint=da6ad8cfd889059bc8f3430856c76b8cb80c65c4 · base=82421b3 · generated=2026-10-08 -->
