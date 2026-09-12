/**
 * Conversión de casing compartida por las reglas de nomenclatura
 * (project-rules/manager-naming, mapper-location, mapper-naming).
 */

/** PascalCase → kebab-case (UserProfile → user-profile). */
export function pascalToKebab(name) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

/** kebab-case → PascalCase (user-profile → UserProfile). */
export function kebabToPascal(name) {
  return name
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}
