import EventEmitter from 'events'

export type Version = [number, string]
export type Value = unknown

export interface Document {
  key: string;
  value: Value;
  version: Version;
}

class Storage extends EventEmitter {
  values = new Map<string, Value>()
  versions = new Map<string, Version>()

  constructor() {
    super()
  }

  public setDocuments(documents: Document[]) {
    this.applyOps(documents, true)
  }

  public shouldApplyOp([newSeq, newAgent]: Version, key: string): boolean {
    const oldVersion = this.versions.get(key)
    return (
      oldVersion === undefined ||
      newSeq > oldVersion[0] ||
      (newSeq === oldVersion[0] && newAgent > oldVersion[1])
    )
  }

  public applyOps(ops: Document[], isLocal: boolean) {
    const filteredOps = ops.filter(({ version, key }) => this.shouldApplyOp(version, key))

    filteredOps.forEach(({ version, key, value }) => {
      this.values.set(key, value)
      this.versions.set(key, version)
    })

    if (filteredOps.length > 0) {
      this.emit(isLocal ? 'applylocal' : 'applyremote', filteredOps)
      this.emit('apply', filteredOps)
    }
  }
}

export default Storage
