import { DataBase } from '../db'
import { IChatState } from '../typings'
import { BaseRepository } from './base'

export class ChatStateRepository extends BaseRepository<IChatState> {
  protected database = new DataBase<IChatState>(process.env.STATE_PATH || 'state.json')
}
