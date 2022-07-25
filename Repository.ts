import { Document } from './Storage'
import { debounce, DebounceFn } from './utils'

export interface DB {
  getKeys: () => Promise<string[]>
  getDocument: (key: string) => Promise<Document>
  getAllDocuments: () => Promise<Document[]>
  setDocument: (document: Document) => Promise<void> 
  setDocuments: (documents: Document[]) => Promise<void>
}

class Repository {
  db: DB
  debounces: Map<string, DebounceFn>

  constructor(db: DB) {
    this.db = db
    this.debounces = new Map<string, DebounceFn>()
  }

  async getKeys(): Promise<string[]> {
    return await this.db.getKeys()
  }

  async getDocument(key: string): Promise<Document> {
    return await this.db.getDocument(key)
  }

  async getAllDocuments(): Promise<Document[]> {
    return await this.db.getAllDocuments()
  }

  setDocument(document: Document) {
    const currentDebounce = this.debounces.get(document.key) ?? debounce(this.db.setDocument)
    this.debounces.set(document.key, currentDebounce)
    currentDebounce(document)
  }
}

export default Repository
