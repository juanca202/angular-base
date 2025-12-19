export const CONTACT_CONTEXT = {
  FORM: 'form',
  DETAIL: 'detail',
  LIST: 'list',
  SEARCH: 'search'
};

export type ContactContext = (typeof CONTACT_CONTEXT)[keyof typeof CONTACT_CONTEXT];
