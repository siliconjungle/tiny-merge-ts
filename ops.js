export const OP_TYPE = {
  CREATE: 0,
  UPDATE: 1,
  DELETE: 2,
}

export const createOp = {
  create: (seq, agent, key, type, value) => ({
    opType: OP_TYPE.CREATE,
    version: [seq, agent],
    key,
    type,
    value,
  }),
  update: (seq, agent, key, type, path, value) => ({
    opType: OP_TYPE.UPDATE,
    version: [seq, agent],
    key,
    type,
    path,
    value,
  }),
  delete: (seq, agent, key, type) => ({
    opType: OP_TYPE.DELETE,
    version: [seq, agent],
    key,
    type,
  }),
}
