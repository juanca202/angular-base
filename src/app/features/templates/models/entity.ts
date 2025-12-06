export interface Entity {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}

export type EntityRequest = Omit<Entity, 'id'> & { id?: string };
