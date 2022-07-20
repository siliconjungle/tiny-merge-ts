import { PRIMITIVE, getPrimitive } from './types.js'

export const deepCopy = (data) => JSON.parse(JSON.stringify(data))

const DEBOUNCE_RATE = 1000

export const debounce = (func, timeout = DEBOUNCE_RATE) => {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      func.apply(this, args)
    }, timeout)
  }
}

export const shouldApplyVersion = ([oldSeq, oldAgent], [newSeq, newAgent]) =>
  newSeq > oldSeq || (newSeq === oldSeq && newAgent > oldAgent)

export const getNestedPaths = (data, currentPath = [], paths = []) => {
  const primitive = getPrimitive(data)

  paths.push(currentPath)
  if (primitive === PRIMITIVE.ARRAY) {
    for (let i = 0; i < data.length; i++) {
      getNestedPaths(data[i], [...currentPath, i], paths)
    }
  } else if (primitive === PRIMITIVE.OBJECT) {
    for (const key in data) {
      getNestedPaths(data[key], [...currentPath, key], paths)
    }
  }

  return paths
}

export const getNestedKeys = (data, currentKey = [], keys = []) => {
  const primitive = getPrimitive(data)

  keys.push(currentKey)
  if (primitive === PRIMITIVE.ARRAY) {
    for (let i = 0; i < data.length; i++) {
      getNestedPaths(data[i], `${currentKey}/${i}`, keys)
    }
  } else if (primitive === PRIMITIVE.OBJECT) {
    for (const key in data) {
      getNestedPaths(data[key], `${currentKey}/${i}`, keys)
    }
  }

  return keys
}

export const getValueAtPath = (path, data) => {
  const value = path.reduce((accumulator, value) => {
    return accumulator[value]
  }, data)
  const primitive = getPrimitive(value)
  if (primitive === PRIMITIVE.ARRAY) {
    return []
  } else if (primitive === PRIMITIVE.OBJECT) {
    return {}
  }
  return value
}

export const setValueAtPath = (path, data, value) => {
  let dataCopy = deepCopy(data)
  if (path.length === 0) return dataCopy
  let currentData = dataCopy
  for (let i = 0; i < path.length - 1; i++) {
    currentData = currentData[path[i]]
  }
  currentData[path[path.length - 1]] = value
  return dataCopy
}

export const fromPathToKey = (path) => {
  return `/${path.join('/')}`
}

export const fromKeyToPath = (key) =>
  key === '/' ? [] : key.split('/').slice(1)
