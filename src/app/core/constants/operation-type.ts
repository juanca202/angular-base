export const OPERATION_TYPE = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete'
};

export type OperationType = (typeof OPERATION_TYPE)[keyof typeof OPERATION_TYPE];
