# Reporte de cobertura — US-003-historial-transferencias

**Fecha:** 2026-10-08 17:37
**Rama:** feature/US-003-historial-transferencias
**Commit:** 17af4c1
**Trabajo:** [US-003](README.md)
**Veredicto:** ⚠️ Aprobado con observaciones

## Resumen

Los 7 criterios tienen caso de prueba y artefacto, y ninguno falla. AC-003 y AC-006 quedan parciales: las pruebas manuales de compartir (TC-007, TC-008) no se ejecutaron y los casos de AC-006 declaran Visual Test sin artefacto.

**Pruebas:** caché fresca de `quality-check` (commit 17af4c1, 2026-10-08). unit `PASS` (250) · e2e `PASS` (31 pasan, 1 omitida).

**Cobertura de criterios de aceptación**

| Total | Cubiertos | Parciales | No cubiertos |
| ----- | --------- | --------- | ------------ |
| 7     | 5         | 2         | 0            |

## Cobertura por criterio

| Criterio | Descripción | Estado | Observaciones |
| -------- | ----------- | ------ | ------------- |
| AC-001 | Historial ordenado del más reciente al más antiguo | ✅ Cubierto | |
| AC-002 | Filtro Todos / Recibidos / Enviados | ✅ Cubierto | |
| AC-003 | Exportar con el nombre original, por descarga o compartiendo | ⚠️ Parcial | TC-007 y TC-008 (compartir) son manuales y no se ejecutaron; la descarga sí está cubierta |
| AC-004 | Eliminar con confirmación y liberar espacio | ✅ Cubierto | Las filas Integration se resuelven con las pruebas unitarias de servicio |
| AC-005 | Solo almacenamiento privado; exportar es la única salida | ✅ Cubierto | TC-013 (Integration) se cubre con pruebas unitarias y el E2E sin peticiones externas |
| AC-006 | Sin desplazamiento horizontal de 360 px a 1280 px | ⚠️ Parcial | TC-015 y TC-016 declaran E2E y Visual Test; no existe prueba visual |
| AC-007 | Mensaje «Aún no hay transferencias» con el historial vacío | ✅ Cubierto | |

## Matriz de trazabilidad

| Criterio | TC | Tipo | Evidencia | Ejecución | Resultado |
| -------- | -- | ---- | --------- | --------- | --------- |
| AC-001 | TC-001 | E2E | [`history.spec.ts`](../../../../../e2e/history.spec.ts) | quality-check | ✅ PASS |
| AC-001 | TC-002 | Unit | [`transfer-history.spec.ts`](../../../../../src/app/core/services/transfer-history.spec.ts) | quality-check | ✅ PASS |
| AC-002 | TC-003 | E2E | [`history.spec.ts`](../../../../../e2e/history.spec.ts) | quality-check | ✅ PASS |
| AC-002 | TC-004 | E2E | [`history.spec.ts`](../../../../../e2e/history.spec.ts) | quality-check | ✅ PASS |
| AC-002 | TC-005 | E2E | [`history.spec.ts`](../../../../../e2e/history.spec.ts) | quality-check | ✅ PASS |
| AC-003 | TC-006 | E2E | [`history.spec.ts`](../../../../../e2e/history.spec.ts) | quality-check | ✅ PASS |
| AC-003 | TC-007 | Manual | [TC-007](test-cases/TC-007-exportar-compartiendo-con-otras-apps-happy.md) | Manual | — N/A |
| AC-003 | TC-008 | Manual | [TC-008](test-cases/TC-008-compartir-cancelado-conserva-historial-error.md) | Manual | — N/A |
| AC-003 | TC-009 | Integration | [`file-export.spec.ts`](../../../../../src/app/core/services/file-export.spec.ts) | quality-check | ✅ PASS |
| AC-003 | TC-009 | E2E | [`history.spec.ts`](../../../../../e2e/history.spec.ts) | quality-check | ✅ PASS |
| AC-004 | TC-010 | Integration | [`transfer-history.spec.ts`](../../../../../src/app/core/services/transfer-history.spec.ts) | quality-check | ✅ PASS |
| AC-004 | TC-010 | E2E | [`history.spec.ts`](../../../../../e2e/history.spec.ts) | quality-check | ✅ PASS |
| AC-004 | TC-011 | E2E | [`history.spec.ts`](../../../../../e2e/history.spec.ts) | quality-check | ✅ PASS |
| AC-004 | TC-012 | E2E | [`history.spec.ts`](../../../../../e2e/history.spec.ts) | quality-check | ✅ PASS |
| AC-005 | TC-013 | Integration | [`transfer-history.spec.ts`](../../../../../src/app/core/services/transfer-history.spec.ts) | quality-check | ✅ PASS |
| AC-005 | TC-014 | E2E | [`history.spec.ts`](../../../../../e2e/history.spec.ts) | quality-check | ✅ PASS |
| AC-006 | TC-015 | E2E | [`history.spec.ts`](../../../../../e2e/history.spec.ts) | quality-check | ✅ PASS |
| AC-006 | TC-015 | Visual Test | — | — | ❌ UNCOVERED |
| AC-006 | TC-016 | E2E | [`history.spec.ts`](../../../../../e2e/history.spec.ts) | quality-check | ✅ PASS |
| AC-006 | TC-016 | Visual Test | — | — | ❌ UNCOVERED |
| AC-007 | TC-017 | E2E | [`history.spec.ts`](../../../../../e2e/history.spec.ts) | quality-check | ✅ PASS |

## Observaciones y pendientes

- Las pruebas manuales con móvil (TC-007, TC-008 y la revisión de iconos) no se ejecutaron por decisión del usuario; el guion está en [guion-validacion-historial.md](assets/guion-validacion-historial.md) y la tarea TK-004 sigue en curso.
- El e2e se ejecutó en el puerto 4300 porque el 4200 lo ocupaba otro proyecto.

<!-- coverage-verify:verdict=APPROVED_WITH_NOTES · fingerprint=da6ad8cfd889059bc8f3430856c76b8cb80c65c4 · spec=365ef6921e5508c87292ec1d1765bb545fd5ab80 · generated=2026-10-08 -->
