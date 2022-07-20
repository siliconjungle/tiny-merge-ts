import assert from 'assert'
import { debounce } from './utils.js'

class Repository {
  constructor(db) {
    this.db = db
    this.debounces = {}
  }

  async getKeys() {
    await db.getKeys()
  }

  async getDocument(key) {
    assert.strictEqual(key, '/')
    return await this.db.getDocument(key)
  }

  async getAllDocuments() {
    await this.db.getAllDocuments()
  }

  async setDocument(key, document, version) {
    assert.strictEqual(key, '/')
    debounces[key] ??= debounce(this.db.setDocument)

    debounces[key](key, document, version)
  }
}

export default Repository
