import { CollectionQueryParams } from '@/core/models/collection';
import { ENTITY_CONTEXT } from '@/shared/constants/entity-context';

export interface Entity {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  position?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EntityInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  notes: string;
}

export type EntityRequestCreate = Omit<Entity, 'id'>;
export type EntityRequestUpdate = Partial<EntityRequestCreate> & {
  id: Entity['id'];
};

export interface EntitySearchParams extends CollectionQueryParams {
  email?: string;
  company?: string;
  isActive?: boolean;
}

export type EntityContext = (typeof ENTITY_CONTEXT)[keyof typeof ENTITY_CONTEXT];
