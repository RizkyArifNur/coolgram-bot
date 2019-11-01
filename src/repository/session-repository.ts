import { DataBase } from '../db'
import { IMessage, ISession } from '../typings'
import { BaseRepository } from './base'

export class SessionRepository extends BaseRepository<ISession> {
  protected database = new DataBase<ISession>(process.env.MESSAGE_RECORDED_PATH || 'message.json')

  getActivedSession(id: number) {
    const message = this.database.read()
    return message.find(m => m.id === id && m.dateEnd === null)
  }

  insertNewMessage(id: number, data: IMessage): ISession {
    const message = this.database.read()
    const desiredMessage = message.find(m => m.id === id)
    if (desiredMessage) {
      desiredMessage.data.push(data)
    } else {
      throw new Error(`Message with id ${id} not found`)
    }
    this.upsert(desiredMessage)
    return desiredMessage
  }
}
