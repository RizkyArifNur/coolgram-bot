import { DataBase } from '../db'
import { ChatStateNotFoundError } from '../provider/error-provider'
import { IChatState, KulgramState } from '../typings'
import { BaseRepository } from './base'

export class ChatStateRepository extends BaseRepository<IChatState> {
  protected database = new DataBase<IChatState>(process.env.STATE_PATH || 'state.json')

  updateKulgramState(chatId: number, state: KulgramState) {
    const data = this.database.read()
    const dataFound = data.find(d => d.id === chatId)
    if (dataFound) {
      dataFound.state = state
    } else {
      throw new ChatStateNotFoundError(`Chat state with id ${chatId} not found`)
    }
  }
}
