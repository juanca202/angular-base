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

export type EntityRequest = Omit<Entity, 'id'> & { id?: string };
