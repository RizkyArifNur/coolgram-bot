import { DataBase } from '../db'
import { IMessage, ISession } from '../typings'
import { BaseRepository } from './base'

export class SessionRepository extends BaseRepository<ISession> {
  protected database = new DataBase<ISession>(process.env.session_RECORDED_PATH || 'session.json')

  getActivedSession(id: number) {
    const session = this.database.read()
    return session.find(m => m.id === id && m.dateEnd === null)
  }

  removeActivedSession(id: number) {
    const session = this.database.read()
    const filteredsession = session.filter(m => m.id !== id && m.dateEnd !== null)
    this.database.write(filteredsession)
  }

  insertNewMessage(id: number, data: IMessage): ISession {
    const session = this.database.read()
    const desiredsession = session.find(m => m.id === id)
    if (desiredsession) {
      desiredsession.messages.push(data)
    } else {
      throw new Error(`session with id ${id} not found`)
    }
    this.upsert(desiredsession)
    return desiredsession
  }
}
