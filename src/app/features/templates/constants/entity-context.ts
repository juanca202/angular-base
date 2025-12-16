export const ENTITY_CONTEXT = {
  FORM: 'form',
  DETAIL: 'detail',
  LIST: 'list',
  SEARCH: 'search'
};

export type EntityContext = (typeof ENTITY_CONTEXT)[keyof typeof ENTITY_CONTEXT];
