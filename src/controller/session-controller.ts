import { IncomingMessage } from 'telegraf/typings/telegram-types'
import { ChatStateRepository } from '../repository/chat-state-repository'
import { SessionRepository } from '../repository/session-repository'
export class SessionController {
  sessionRepository = new SessionRepository()
  chatStateRepository = new ChatStateRepository()
  getSessionById(id: number) {
    return this.sessionRepository.findById(id)
  }
  handle(message: IncomingMessage) {
    let isQna = false
    const chatId = message.chat.id
    const state = this.chatStateRepository.findById(chatId)

    if (state) {
      if (state.state === 'STARTING') {
        this.sessionRepository.insert({
          author: '',
          data: [],
          dateEnd: null,
          dateStart: new Date(),
          id: message.chat.id,
          title: message.text
        })
        this.chatStateRepository.updateKulgramState(chatId, 'PICK-AUTHOR')
        return
      } else if (state.state === 'PICK-AUTHOR') {
        const msg = this.sessionRepository.getActivedSession(chatId)
        if (!msg) {
          throw new Error('Something went wrong') // TODO: Please fix this
        }
        msg.author = message.text
        this.sessionRepository.update(msg.id, {
          author: msg.author,
          data: msg.data,
          dateEnd: msg.dateEnd,
          dateStart: msg.dateStart,
          title: msg.title
        })
        this.chatStateRepository.updateKulgramState(chatId, 'STARTED')
        return
      }
      isQna = state.state === 'START-QNA'

      const chatAlreadyRecorded = this.sessionRepository.getActivedSession(chatId)
      if (chatAlreadyRecorded) {
        this.sessionRepository.insertNewMessage(chatId, {
          firstName: message.from!.first_name,
          isQna,
          lastName: message.from!.last_name || '',
          message: message.text!
        })
      } else {
        this.sessionRepository.insert({
          data: [
            {
              firstName: message.from!.first_name,
              isQna,
              lastName: message.from!.last_name || '',
              message: message.text!
            }
          ],
          dateEnd: null,
          dateStart: new Date(),
          id: message.chat.id
        })
      }
    }
  }
}
