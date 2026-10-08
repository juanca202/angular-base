# Code Review — US-001-enviar-archivo-qr

**Fecha:** 2026-10-08 17:09
**Rama:** feature/US-001-enviar-archivo-qr
**Commit:** a551fb3
**Alcance del diff:** rama contra `main` (incluye lo no commiteado) — 36 archivos de código (+2221/−51 aprox., sin documentación)
**Modo:** default
**Base del diff:** main @ 26bbb1b
**Veredicto:** ✅ Aprobado — cero hallazgos bloqueantes; tres hallazgos menores.

## Resumen

La implementación del envío es sólida: protocolo de fragmentación separado de la UI y versionado, almacenamiento privado con limpieza ante fallo y cuota, emisión en bucle con cadencia corregida contra el inicio, y una pantalla pequeña que delega en un manager. Las capas respetan ADR-001/011/015 y los mensajes de error son claros. Se anotan tres mejoras no bloqueantes.

## Intención detectada

Fuente: [US-001](../specs/changes/user-stories/US-001-enviar-archivo-qr/README.md) (selector de un solo archivo, secuencia de QR en bucle sin progreso, copia en almacenamiento privado, cancelar sin confirmación, errores claros, PWA sin red). El diff implementa todos los criterios de comportamiento. Las pruebas manuales con móviles (TK-006 IT-03) siguen pendientes; es validación de campo, no un defecto del código.

## Hallazgos

Leyenda de severidad: `🔴` Crítico · `🟠` Mayor · `🟡` Menor · `💡` Sugerencia · `✅` Sin hallazgos.

### Análisis semántico (intención)

✅ Sin hallazgos. Cada pieza traza a un criterio de la US; la velocidad fija de 8 fps queda documentada como pendiente de validar con cámara.

### Arquitectura y diseño

🟡 **Fiabilidad / Mantenibilidad — `PrivateStorage.list()` falla entero ante un registro corrupto** ([private-storage.ts](../../src/app/core/services/private-storage.ts)). `JSON.parse` sin protección: si un `.json` queda truncado (cierre del navegador entre la escritura del contenido y la del registro), `list()` lanza y el historial de US-003 no cargaría ninguna entrada. Sugerencia: omitir (o limpiar) los registros ilegibles y huérfanos dentro de `list()`.

🟡 **Fiabilidad — cancelar durante la preparación no surte efecto** ([send-page.ts](../../src/app/features/send/components/send-page.ts)). `start()` es asíncrono (lee, hashea y guarda); si el usuario pulsa Cancelar en esa ventana, `cancel()` limpia el estado pero al terminar `start()` arranca igualmente la emisión. Sugerencia: comprobar un contador/token de operación antes de `manager.start`.

🟡 **Mantenibilidad — `SendFileValidator` sin spec propio** ([send-file-validator.ts](../../src/app/features/send/services/send-file-validator.ts)). Se prueba solo indirectamente desde `send-page.spec.ts` y los e2e; un spec propio documentaría cada rama (navegador no compatible, vacío, demasiados fragmentos, error inesperado relanzado).

### Feedback adicional

- Buen diseño: `fragment-file.ts` no conoce `File` ni el DOM, `countFragments` valida el límite antes de leer el contenido, y `SendSequenceManager` mide la cadencia contra el inicio para no acumular retrasos.
- El bundle inicial excede en 5.84 kB su presupuesto (aviso de build); conviene vigilarlo al añadir la recepción.

## Próximas acciones

Sin acciones bloqueantes. Las tres mejoras menores pueden tratarse en un seguimiento (la primera conviene antes de implementar US-003).

<!-- code-review:verdict=APPROVED · mode=default · fingerprint=4d9bc4efdf5073a19e42c00424a450a0911542d6 · base=26bbb1b · generated=2026-10-08 -->
