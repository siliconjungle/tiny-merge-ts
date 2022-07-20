import EventEmitter from 'events'
import { OP_TYPE } from './ops.js'
import { shouldApplyVersion, setValueAtPath, getValueAtPath } from './utils.js'
import { isPrimitive, getType, matchesType } from './types.js'

class Storage extends EventEmitter {
  constructor() {
    super()
    this.values = {}
    this.versions = {}
  }

  setDocuments(documents) {
    const filteredDocuments = documents.filter(({ key, version }) => {
      return this.shouldCreate({ version, key, type, value })
    })

    filteredDocuments.forEach(({ version, key, type, value }) => {
      this.createDocument(version, key, type, value)
    })

    if (filteredDocuments.length > 0) {
      this.emit('applylocal')
      this.emit('apply')
    }
  }

  shouldCreate({ newVersion, key, type, value }) {
    const finalKey = `/${type}/${key}`

    if (this.values[finalKey] === undefined) {
      return true
    }

    const typeDef = getType(type)
    if (typeDef === null || !matchesType(value, typeDef)) {
      return false
    }

    const oldVersion = this.versions[finalKey].version
    return shouldApplyVersion(oldVersion, newVersion)
  }

  shouldUpdate({ newVersion, newFieldVersion, key, path, value }) {
    const finalKey = `/${type}/${key}`

    if (this.values[finalKey] === undefined) {
      return false
    }

    const currentValue = getValueAtPath(path, this.values[finalKey])

    if (!isPrimitive(currentValue, getPrimitive(value))) {
      return false
    }

    const documentVersion = this.versions[finalKey].version
    if (!shouldApplyVersion(documentVersion, newVersion)) {
      return false
    }

    const fieldVersion = this.versions[finalKey].fields[path]
    if (fieldVersion === undefined) {
      return false
    }
    return shouldApplyVersion(fieldVersion, newFieldVersion)
  }

  shouldDelete({ newVersion, key, type }) {
    const finalKey = `/${type}/${key}`
    if (this.values[finalKey] === undefined) {
      return false
    }

    const documentVersion = this.versions[finalKey].version
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
    const finalKey = `/${type}/${key}`
    this.values[finalKey] = value
    const fieldKeys = getNestedKeys(value)

    const fields = fieldKeys.reduce((acc, fieldKey) => {
      acc[fieldKey] = 0
      return acc
    }, {})

    this.versions[finalKey] = {
      version,
      fields,
    }
  }

  updateDocument({ fieldVersion, key, type, path, value }) {
    const finalKey = `/${type}/${key}`
    this.versions[finalKey].fields[path] = fieldVersion
    setValueAtPath(path, this.values[finalKey], value)
  }

  deleteDocument({ version, key, type }) {
    const finalKey = `/${type}/${key}`
    delete this.values[finalKey]
    this.versions[finalKey] = { version, fields: {} }
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
