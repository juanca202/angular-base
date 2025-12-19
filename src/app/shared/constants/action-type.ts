export const ACTION_TYPE = {
  GROUP: 'group',
  ITEM: 'item'
};

export type ActionType = (typeof ACTION_TYPE)[keyof typeof ACTION_TYPE];
