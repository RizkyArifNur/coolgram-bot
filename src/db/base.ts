import { existsSync, readFileSync, writeFileSync } from 'fs'
import { IBaseData } from '../typings'

export class DataBase<T extends IBaseData> {
  protected filePath = process.env.MESSAGE_RECORDED_PATH || 'database.json'
  read(): T[] {
    this.ensureFileExists()
    return JSON.parse(readFileSync(this.filePath).toString())
  }

  write(data: T[]) {
    console.log(`Writing file to ${this.filePath}`, data)

    this.ensureFileExists()
    writeFileSync(this.filePath, JSON.stringify(data))
  }

  private ensureFileExists() {
    /**
     * check if message already exists
     */
    if (!existsSync(this.filePath)) {
      /**
       * if message not found then create it
       */
      writeFileSync(this.filePath, '[]')
    }
  }
}
