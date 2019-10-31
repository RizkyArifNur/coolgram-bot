import { ChatStateDb } from '../db'
import { IChatState } from '../typings'
import { BaseRepository } from './base'

export class ChatStateRepository extends BaseRepository<IChatState> {
  protected database = new ChatStateDb()
}
