import EventEmitter from 'events'

class Storage extends EventEmitter {
  constructor() {
    super()
    this.values = {}
    this.versions = {}
  }

  setDocuments(documents) {
    documents.forEach(({ key, version, value }) => {
      this.values[key] = value
      this.versions[key] = version
    })
  }

  shouldApplyOp([[newVersion, newAgent], key]) {
    const [oldVersion, oldAgent] = this.versions[key]
    return (
      newVersion > oldVersion ||
      (newVersion === oldVersion && newAgent > oldAgent)
    )
  }

  applyOps(ops, isLocal) {
    const filteredOps = ops.filter(([version, key]) =>
      this.shouldApplyOp(this.versions[key], version)
    )

    filteredOps.forEach(([version, key, value]) => {
      this.values[key] = value
      this.versions[key] = version
    })

    if (filteredOps.length > 0) {
      this.emit(isLocal ? 'applylocal' : 'applyremote', filteredOps)
    }
  }
}

export default Storage
