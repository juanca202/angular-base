# TK-002: Servicio de exportación: descarga y compartir con el nombre original

<!-- tk:status=Ready -->
**Estado:** Ready
**Historia:** [US-003](./README.md)
**Repositorio:** laboratorio-1
**Asignado a:** juanca202

## Descripción

Disponer de un servicio que exporte un archivo del historial con su nombre original y contenido íntegro, por descarga o compartiéndolo con otras aplicaciones del dispositivo cuando el navegador lo permita. La exportación solo se inicia por una acción explícita del usuario y es la única salida de archivos de la aplicación; si el usuario cierra la hoja de compartir sin elegir aplicación, el historial queda intacto.

## Dependencias

- Servicio de historial (TK-001) — lectura del archivo y su nombre original
- Web Share API (`navigator.share` / `navigator.canShare` con archivos) — compartir con otras aplicaciones
- Descarga mediante enlace con `download` y URL de objeto — exportar por descarga
- Decorador `@Service` de Angular — servicio singleton

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
    └── services/
        ├── + file-export.ts                # descarga y compartir con el nombre original
        └── + file-export.spec.ts           # pruebas con dobles de las APIs del navegador
```

## Plan de implementación

- [ ] **IT-01** — Implementar la exportación por descarga con el nombre original y liberar la URL de objeto al terminar
- [ ] **IT-02** — Implementar el compartir con archivos cuando `canShare` lo admita, y tratar el cierre de la hoja sin elegir aplicación como una cancelación sin efectos
- [ ] **IT-03** — Exponer si compartir está disponible para que la interfaz ofrezca solo las opciones posibles
- [ ] **IT-04** — Probar con dobles: nombre original (con espacios, acentos y varios puntos), contenido idéntico, cancelación de compartir y ausencia de salida sin llamada explícita
- [ ] **IT-05** — Documentar con TSDoc

## Observaciones

- Saneamiento de nombres y tratamiento de nombres duplicados al exportar: pendiente de acordar en esta tarea (SRS-001, sección 15); si se modifica algún carácter del nombre, documentarlo y ajustar el caso de prueba de nombres especiales.
- Compartir archivos está confirmado en Chrome 154 sobre Android 10; en otros navegadores no hay garantía.
