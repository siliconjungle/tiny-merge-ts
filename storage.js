import EventEmitter from 'events'
import assert from 'assert'
import { OP_TYPE } from './ops.js'
import { shouldApplyVersion, setValueAtPath, getValueAtPath } from './utils.js'
import { isPrimitive, getType, matchesType, TYPES } from './types.js'

class Storage extends EventEmitter {
  constructor() {
    super()
    this.values = {}
    this.versions = {}
    Object.keys(TYPES).forEach((type) => {
      this.values[type] = {}
      this.versions[type] = {}
    })
  }

  setDocuments(documents) {
    const filteredDocuments = documents.filter(
      ({ version, key, type, value }) => {
        return this.shouldCreate({ version, key, type, value })
      }
    )

    filteredDocuments.forEach(({ version, key, type, value }) => {
      this.createDocument(version, key, type, value)
    })

    if (filteredDocuments.length > 0) {
      this.emit('applylocal')
      this.emit('apply')
    }
  }

  shouldCreate({ newVersion, key, type, value }) {
    if (this.values[type] === undefined) {
      return false
    }

    if (this.values[type][key] === undefined) {
      return true
    }

    const typeDef = getType(type)
    if (typeDef === null || !matchesType(value, typeDef)) {
      return false
    }

    const oldVersion = this.versions[type][key].version
    return shouldApplyVersion(oldVersion, newVersion)
  }

  shouldUpdate({ newVersion, newFieldVersion, type, key, path, value }) {
    if (this.values[type]?.[key] === undefined) {
      return false
    }

    const currentValue = getValueAtPath(path, this.values[type][key])

    if (!isPrimitive(currentValue, getPrimitive(value))) {
      return false
    }

    const documentVersion = this.versions[type][key].version
    if (!shouldApplyVersion(documentVersion, newVersion)) {
      return false
    }

    const fieldVersion = this.versions[type][key].fields[path]
    if (fieldVersion === undefined) {
      return false
    }
    return shouldApplyVersion(fieldVersion, newFieldVersion)
  }

  shouldDelete({ newVersion, key, type }) {
    if (this.values[type]?.[key] === undefined) {
      return false
    }

    const documentVersion = this.versions[type][key].version
    return shouldApplyVersion(documentVersion, newVersion)
  }

  shouldApplyOp({ opType, ...op }) {
    switch (opType) {
      case OP_TYPE.CREATE: {
        return this.shouldCreate(op)
      }
      case OP_TYPE.UPDATE: {
        return this.shouldUpdate(op)
      }
      case OP_TYPE.DELETE: {
        return this.shouldApplyOp(op)
      }
      default:
        return false
    }
  }

  createDocument({ version, key, type, value }) {
    assert.strictEqual(this.values[type], undefined)
    this.values[type][key] = value
    const fieldKeys = getNestedKeys(value)

    const fields = fieldKeys.reduce((acc, fieldKey) => {
      acc[fieldKey] = 0
      return acc
    }, {})

    this.versions[type][key] = {
      version,
      fields,
    }
  }

  updateDocument({ fieldVersion, key, type, path, value }) {
    this.versions[type][key].fields[path] = fieldVersion
    setValueAtPath(path, this.values[type][key], value)
  }

  deleteDocument({ version, key, type }) {
    delete this.values[type][key]
    this.versions[type][key] = { version, fields: {} }
  }

  applyOps(ops, isLocal) {
    const filteredOps = ops.filter((op) => this.shouldApplyOp(op))

    filteredOps.forEach(({ opType, ...op }) => {
      switch (opType) {
        case OP_TYPE.CREATE: {
          return this.createDocument(op)
        }
        case OP_TYPE.UPDATE: {
          return this.shouldUpdate(op)
        }
        case OP_TYPE.DELETE: {
          return this.shouldDelete(op)
        }
        default:
          return false
      }
    })

    if (filteredOps.length > 0) {
      this.emit(isLocal ? 'applylocal' : 'applyremote', filteredOps)
      this.emit('apply', filteredOps)
    }
  }
}

export default Storage
