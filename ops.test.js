import assert from 'assert/strict'
import { OP_TYPE, createOp } from './ops.js'
import { TYPE } from './types.js'

describe('Ops', () => {
  it('create', () => {
    const op = createOp.create(0, 'james', 'foo', TYPE.SHAPE, 'Hello world')
    assert.deepEqual(op, [OP_TYPE.CREATE, 0, 'james', 'foo', TYPE.SHAPE, 'Hello world'])
  })
  it('update', () => {
    
  })
})
