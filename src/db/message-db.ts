import { ISession } from '../typings'
import { DataBase } from './index'
export class MessageDb extends DataBase<ISession> {
  filePath = process.env.MESSAGE_RECORDED_PATH || 'message.json'
}
