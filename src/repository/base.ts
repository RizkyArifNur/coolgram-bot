import { DataBase } from '../db'
import { IBaseData } from '../typings'

export class BaseRepository<T extends IBaseData> {
  protected database: DataBase<T>

  findById(id: number) {
    return this.database.read().find(m => m.id === id)
  }

  find() {
    return this.database.read()
  }

  insert(data: T) {
    const messages = this.database.read()
    messages.push(data)
    this.database.write(messages)
    return data
  }

  upsert(data: T) {
    const dataFound = this.database.read().find(d => d.id === data.id)
    const dataToProcess = Object.assign({}, data)
    if (!dataFound) {
      // insert
      this.insert(dataToProcess)
    } else {
      // update
      delete dataToProcess.id
      this.update(data.id, dataToProcess)
    }
  }

  update(id: number, data: Omit<T, 'id'>) {
    const messages = this.database.read()

    const dataToWrite = messages.map<T>(m => {
      if (m.id === id) {
        return {
          id,
          ...data
        } as T
      }
      return m
    })

    this.database.write(dataToWrite)
    return {
      chatId: id,
      ...data
    }
  }

  removeById(id: number) {
    const messages = this.database.read()
    this.database.write(messages.filter(m => m.id !== id))
    return id
  }
}
