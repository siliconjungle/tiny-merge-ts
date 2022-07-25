import { debounce } from './utils.js'

class Repository {
  constructor(db) {
    this.db = db
    this.debounces = {}
  }

  async getKeys() {
    await db.getKeys()
  }

  async getDocument(type, key) {
    return await this.db.getDocument(type, key)
  }

  async getAllDocuments() {
    await this.db.getAllDocuments()
  }

  async setDocument(type, key, document) {
    debounces[key] ??= debounce(this.db.setDocument)
    debounces[key](type, key, document)
  }
}

export default Repository
