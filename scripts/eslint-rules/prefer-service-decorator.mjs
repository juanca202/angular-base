/**
 * ESLint rule: project-rules/prefer-service-decorator
 *
 * ADR-015 / coding-style CR-005 — los servicios de alcance de aplicación deben
 * declararse con @Service en vez de @Injectable({ providedIn: 'root' }).
 *
 * Regla propia (en vez de sumar este selector al no-restricted-syntax ya usado
 * por CR-009): ambas reglas compartirían el mismo nombre de regla, y dos config
 * objects de eslint.config.mjs con `no-restricted-syntax` sobre archivos que se
 * solapan se pisarían entre sí (flat config no fusiona arrays por clave) — y
 * este criterio necesita severidad `warn` (Enfoque: warning), distinta de la de
 * CR-009 (`error`), así que tampoco puede ir en la misma entrada de esa regla.
 */

const SELECTOR =
  "Decorator > CallExpression[callee.name='Injectable'] > ObjectExpression > Property[key.name='providedIn'] > Literal[value='root']";

/** @type {import('eslint').Rule.RuleModule} */
const rule = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        "Prefer @Service over @Injectable({ providedIn: 'root' }) for app-scoped singleton services (ADR-015).",
    },
    schema: [],
    messages: {
      useService:
        "Usa @Service en vez de @Injectable({ providedIn: 'root' }) para servicios de alcance de aplicación (ADR-015).",
    },
  },
  create(context) {
    return {
      [SELECTOR](node) {
        context.report({ node, messageId: 'useService' });
      },
    };
  },
};

export default rule;
