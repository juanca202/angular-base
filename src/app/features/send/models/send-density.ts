/**
 * Tamaños de fragmento (bytes de archivo por QR) que el usuario puede elegir. Más bytes por QR
 * significan menos QR pero más densos, y por tanto más difíciles de leer; 1600 B ya llega a un QR
 * muy denso (más de 140 módulos por lado) y solo sirve con buena pantalla y cámara.
 *
 * @since 1.0.0
 */
export const DENSITY_OPTIONS = [200, 400, 800, 1200, 1600] as const;
