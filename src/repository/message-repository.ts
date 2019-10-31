import { MessageDb } from '../db/message-db'
import { IMessage, ISession } from '../typings'
import { BaseRepository } from './base'

export class MessageRepository extends BaseRepository<ISession> {
  protected database = new MessageDb()

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
