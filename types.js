import { getNestedKeys } from './utils'

export const PRIMITIVE = {
  STRING: 'string',
  NUMBER: 'number',
  BOOLEAN: 'boolean',
  OBJECT: 'object',
  ARRAY: 'array',
  NULL: 'null',
}

export const getPrimitive = (value) => {
  if (value === null) {
    return PRIMITIVE.NULL
  }
  if (Array.isArray(value)) {
    return PRIMITIVE.ARRAY
  }
  switch (typeof value) {
    case PRIMITIVE.STRING:
      return PRIMITIVE.STRING
    case PRIMITIVE.NUMBER:
      return PRIMITIVE.NUMBER
    case PRIMITIVE.BOOLEAN:
      return PRIMITIVE.BOOLEAN
    case PRIMITIVE.OBJECT:
      return PRIMITIVE.OBJECT
    default:
      throw new Error(`Unsupported type: ${typeof value}`)
  }
}

export const isPrimitive = (value, primitive) =>
  getPrimitive(value) === primitive

export const TYPE = {
  SHAPE: 'shape',
  POSITION: 'position',
  SIZE: 'size',
}

export const POSITION = {
  x: PRIMITIVE.NUMBER,
  y: PRIMITIVE.NUMBER,
}

export const SIZE = {
  width: PRIMITIVE.NUMBER,
  height: PRIMITIVE.NUMBER,
}

export const SHAPE = {
  position: POSITION,
  size: SIZE,
}

export const TYPES = {
  shape: SHAPE,
  position: POSITION,
  size: SIZE,
}

export const getType = (typeName) => TYPES[typeName] ?? null

// Needs an additional code for things like lists where you can just grow the size
// with elements of a particular type.
export const matchesType = (value, type) => {
  const valueKeys = getNestedKeys(value)
  const typeKeys = getNestedKeys(type)
  const keySet = new Set(...valueKeys, ...typeKeys)
  if (valueKeys.length !== keySet.size) {
    return false
  }
  for (const valueKey of valueKeys) {
    const valueType = getPrimitive(value[valueKey])
    const typeType = getPrimitive(type[valueKey])
    if (valueType !== typeType) {
      return false
    }
  }
  return true
}
