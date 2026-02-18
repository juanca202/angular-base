import type {
  Entity,
  EntityInput,
  EntityRequestCreate,
  EntityRequestUpdate
} from '../models/entity';

/**
 * Mapper para transformar entre representaciones de Entity.
 *
 * @remarks
 * Sigue ADR-008: funciones puras sin efectos secundarios.
 */
export const EntityMapper = {
  /**
   * Convierte Entity (del backend/dominio) a EntityInput (para formularios).
   */
  mapEntityToInput(entity: Entity): EntityInput {
    return {
      firstName: entity.firstName,
      lastName: entity.lastName,
      email: entity.email,
      phone: entity.phone,
      company: entity.company ?? '',
      position: entity.position ?? '',
      notes: entity.notes ?? ''
    };
  },

  /**
   * Convierte EntityInput (del formulario) a EntityRequestCreate para la API.
   */
  mapInputToRequestCreate(input: EntityInput): EntityRequestCreate {
    const now = new Date().toISOString();
    return {
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone,
      company: input.company || undefined,
      position: input.position || undefined,
      notes: input.notes || undefined,
      createdAt: now,
      updatedAt: now
    };
  },

  /**
   * Convierte EntityInput (del formulario) a EntityRequestUpdate para la API.
   */
  mapInputToRequestUpdate(input: EntityInput, id: string): EntityRequestUpdate {
    return {
      id,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone,
      company: input.company || undefined,
      position: input.position || undefined,
      notes: input.notes || undefined
    };
  }
};
