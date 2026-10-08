# Insumo 02: hallazgos del spike WI-002 y decisiones del usuario

Origen: informe del [spike WI-002](../../../../archived/work-items/WI-002-spike-medicion-qr-android/spike-report.md) (veredicto: viable con trabajo; consolida también el [WI-001](../../../../archived/work-items/WI-001-spike-protocolo-transferencia-qr/spike-report.md)) y criterios ya incorporados a [US-001](../../../user-stories/US-001-enviar-archivo-qr/README.md) y [US-002](../../../user-stories/US-002-recibir-archivo-qr/README.md).

Decisiones del usuario al refinar el SRS (2026-10-08):

- Compatibilidad de esta versión: solo Chrome en Android (lo probado en el spike); el resto, sin garantía.
- Objetivo de 1 MB en 15 minutos: se registra como objetivo (DEBERÍA), verificado con transferencias reales; no bloquea Ready.
- Repositorio: laboratorio-1 (este repositorio), existente, con cambios.
- Ya decidido en las historias: fragmento por defecto de 400 B con corrección M; corrección de errores y códigos de fuente (fountain) diferidos; el receptor pide confirmar nombre y tamaño antes de dar por activa una transferencia.
