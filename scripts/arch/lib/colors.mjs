/**
 * Colorea el prefijo de estado (PASS/WARN/FAIL) de las líneas de protocolo que
 * imprime cada `check()` de scripts/arch/checks/*.mjs.
 *
 * Usa `util.styleText` (Node nativo, sin dependencias). Por defecto respeta si
 * la salida es una terminal real (o `FORCE_COLOR`/`NO_COLOR`); el runner
 * (../verify.mjs) propaga `FORCE_COLOR` a los checks hijos cuando su propia
 * salida ya es una terminal, para que el color sobreviva al pipe entre procesos.
 */
import { styleText } from 'node:util';

const COLOR_BY_STATUS = {
  PASS: 'green',
  WARN: 'yellow',
  FAIL: 'red',
};

export function colorStatus(status) {
  const color = COLOR_BY_STATUS[status];
  return color ? styleText(color, status) : status;
}

/** Quita los códigos ANSI de `text` (para contar líneas de protocolo ya coloreadas). */
export function stripAnsi(text) {
  return text.replace(/\x1b\[[0-9;]*m/g, '');
}
