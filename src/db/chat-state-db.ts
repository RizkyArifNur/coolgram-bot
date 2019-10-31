import { DataBase } from '.'
import { IChatState } from '../typings'

export class ChatStateDb extends DataBase<IChatState> {
  filePath = process.env.STATE_PATH || 'state.json'
}
